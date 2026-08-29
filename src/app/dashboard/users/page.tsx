"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useClerk } from "@clerk/nextjs";
import { PageHeader } from "@/components/dashboard/page-header";
import { logSystemActivity } from "@/lib/audit-logger";
import { ROLE_CONFIG, STATUS_CONFIG } from "@/data/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserCog,
  Search,
  Loader2,
  SlidersHorizontal,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  History,
  Lock,
  ChevronRight,
  KeyRound,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import type { SystemUser, UserRole, UserStatus } from "@/data/users";
import { toast } from "sonner";
import { useUserRole } from "@/lib/use-user-role";

// Formats timestamp to MM-DD hh:mm A (e.g. 08-29 09:35 AM)
function formatLastActive(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = String(hours % 12 || 12).padStart(2, "0");
  return `${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
}

// User column is permanent/unhideable, Manage column is removed
type OptionalColumnKey =
  | "email"
  | "role"
  | "status"
  | "zone"
  | "actions"
  | "lastActive";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentClerkUser } = useUser();
  const { signOut } = useClerk();
  const { role: currentUserRole, isAdmin } = useUserRole();

  // Search & Filter State
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column Visibility Toggle State (User is unhideable, Manage is removed)
  const [visibleColumns, setVisibleColumns] = useState<Record<OptionalColumnKey, boolean>>({
    email: true,
    role: true,
    status: true,
    zone: true,
    actions: true,
    lastActive: true,
  });

  const toggleColumn = (key: OptionalColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1 (User column) + togglable columns
  const visibleColumnCount = useMemo(() => {
    return 1 + Object.values(visibleColumns).filter(Boolean).length;
  }, [visibleColumns]);

  // Selected User for Right-Side Sheet
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Edit Role Form inside Right-Side Sheet
  const [editRole, setEditRole] = useState<UserRole>("viewer");
  const [editZone, setEditZone] = useState<string>("All Zones");

  // Delete User Dialog State
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // TanStack Query: Fetch live users from Supabase
  const { data: usersList = [], isLoading } = useQuery<SystemUser[]>({
    queryKey: ["users-list"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users from Supabase:", error);
        return [];
      }

      // Filter out sample seed users so only real registered accounts appear
      const realUsers = (data || []).filter(
        (u) => !u.id.startsWith("USR-") && !u.email.endsWith("@smartgrow.io")
      );

      return realUsers.map((u) => {
        const initials = (u.full_name || u.email)
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return {
          id: u.id,
          fullName: u.full_name || u.email.split("@")[0],
          email: u.email,
          role: u.role,
          status: u.status,
          avatar: u.avatar || initials,
          avatarGradient: u.avatar_gradient || "from-emerald-500 to-teal-600",
          zone: u.zone || "Zone A",
          lastActive: u.last_active || u.created_at,
          joinedAt: u.created_at,
          sessionsToday: u.sessions_today ?? 1,
          actionsThisWeek: u.actions_this_week ?? 0,
        };
      });
    },
    enabled: typeof window !== "undefined",
    refetchInterval: 3000,
  });

  // TanStack Query: Fetch Weekly Activity from live Supabase actuator logs
  const { data: weeklyActivity = [] } = useQuery<{ day: string; actions: number }[]>({
    queryKey: ["weekly-user-activity"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) {
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
          day,
          actions: 0,
        }));
      }

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);

      const { data: logs, error } = await supabase
        .from("actuator_logs")
        .select("created_at")
        .gte("created_at", monday.toISOString());

      if (error) {
        console.error("Error fetching weekly activity:", error);
      }

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const counts = [0, 0, 0, 0, 0, 0, 0];

      (logs || []).forEach((log) => {
        const logDate = new Date(log.created_at);
        const idx = (logDate.getDay() + 6) % 7;
        counts[idx] += 1;
      });

      return days.map((day, i) => ({
        day,
        actions: counts[i],
      }));
    },
    enabled: typeof window !== "undefined",
    refetchInterval: 5000,
  });

  // Safe sign out helper that handles already-deleted sessions cleanly without runtime error overlays
  const handleSignOutCleanly = useCallback(async (msg: string) => {
    toast.error(msg);
    try {
      await signOut().catch(() => {});
    } catch {
      // Silently swallow already-deleted session errors
    } finally {
      window.location.replace("/login");
    }
  }, [signOut]);

  // Realtime check: If current user's account is removed from usersList, instantly sign out
  useEffect(() => {
    if (isLoading || !currentClerkUser || usersList.length === 0) return;
    const stillExists = usersList.some((u) => u.id === currentClerkUser.id);
    if (!stillExists) {
      handleSignOutCleanly("Your account has been deleted by an administrator.");
    }
  }, [usersList, isLoading, currentClerkUser, handleSignOutCleanly]);

  // Supabase Realtime Subscription: Instant updates on database changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `realtime-users-changes-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          if (
            payload.eventType === "DELETE" &&
            currentClerkUser &&
            (payload.old as { id?: string })?.id === currentClerkUser.id
          ) {
            handleSignOutCleanly("Your account has been deleted by an administrator.");
            return;
          }
          queryClient.invalidateQueries({ queryKey: ["users-list"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "actuator_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["weekly-user-activity"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, currentClerkUser, handleSignOutCleanly]);

  // TanStack Mutation: Update User Role & Access
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      id,
      role,
      zone,
    }: {
      id: string;
      role: UserRole;
      zone: string;
    }) => {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const { error } = await supabase
        .from("users")
        .update({
          role,
          zone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      const targetName = selectedUser?.fullName || "User";
      toast.success(
        `Updated ${targetName}'s permissions to ${variables.role.toUpperCase()}`
      );
      if (selectedUser) {
        setSelectedUser((prev) => prev ? { ...prev, role: variables.role, zone: variables.zone } : null);
      }

      // Log to System Logs
      logSystemActivity({
        source: "USER_MGMT",
        category: "crud",
        severity: "info",
        action: "UPDATE_ROLE",
        message: `Updated permissions for '${targetName}' to ${variables.role.toUpperCase()}`,
        details: `Zone assigned: ${variables.zone}`,
      });
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update permissions."
      );
    },
  });

  // TanStack Mutation: Admin Delete User (Supabase + Clerk)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/delete-user?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete user account.");
      }
    },
    onSuccess: () => {
      const deletedName = deletingUser?.fullName || "User";
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success(`User ${deletedName} has been permanently deleted.`);

      // Log to System Logs
      logSystemActivity({
        source: "USER_MGMT",
        category: "crud",
        severity: "warning",
        action: "DELETE_USER",
        message: `Deleted user account '${deletedName}'`,
        details: `Email: ${deletingUser?.email || "N/A"}. Access revoked.`,
      });

      setDeletingUser(null);
      setSelectedUser(null);
      setDeleteConfirmText("");
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete user account."
      );
    },
  });

  // Helper to determine whether a user is currently Online
  const isUserOnline = useCallback(
    (user: SystemUser) => {
      if (currentClerkUser && currentClerkUser.id === user.id) return true;
      if (!user.lastActive) return false;
      const diffMs = Date.now() - new Date(user.lastActive).getTime();
      return diffMs < 3 * 60 * 1000; // Active within 3 minutes
    },
    [currentClerkUser]
  );

  // Computed summary metrics
  const summary = useMemo(() => {
    const total = usersList.length;
    const onlineCount = usersList.filter(isUserOnline).length;
    const activeAccounts = usersList.filter((u) => u.status === "active").length;
    const totalWeeklyActions = weeklyActivity.reduce((sum, d) => sum + d.actions, 0);

    const adminCount = usersList.filter((u) => u.role === "admin").length;
    const operatorCount = usersList.filter((u) => u.role === "operator").length;
    const technicianCount = usersList.filter((u) => u.role === "technician").length;
    const viewerCount = usersList.filter((u) => u.role === "viewer").length;
    const staffCount = adminCount + operatorCount + technicianCount;

    return {
      total,
      onlineCount,
      activeAccounts,
      totalWeeklyActions,
      adminCount,
      operatorCount,
      technicianCount,
      viewerCount,
      staffCount,
    };
  }, [usersList, weeklyActivity, isUserOnline]);

  // Role distribution for donut chart
  const roleDistribution = useMemo(() => {
    return [
      { name: "Admin", value: summary.adminCount, fill: "#a855f7" },
      { name: "Operator", value: summary.operatorCount, fill: "#10b981" },
      { name: "Technician", value: summary.technicianCount, fill: "#f59e0b" },
      { name: "Viewer", value: summary.viewerCount, fill: "#38bdf8" },
    ];
  }, [summary]);

  // Filtered & Paginated records
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return usersList;
    return usersList.filter((u) => {
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.zone.toLowerCase().includes(q)
      );
    });
  }, [usersList, query]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredUsers, safePage, pageSize]);

  // Open Right-Side Sheet for Selected User
  const handleSelectUser = (user: SystemUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditZone(user.zone);
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    updatePermissionsMutation.mutate({
      id: selectedUser.id,
      role: editRole,
      zone: editZone,
    });
  };

  const handleOpenDelete = (user: SystemUser) => {
    setDeletingUser(user);
    setDeleteConfirmText("");
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteUserMutation.mutate(deletingUser.id);
  };

  // Replaced Metric Cards
  const metrics = [
    {
      title: "Total Users",
      value: String(summary.total),
      icon: Users,
      gradient: "from-violet-500/5",
      iconClass: "text-violet-400",
      badge: `${summary.activeAccounts} Active`,
      badgeClass: "text-emerald-400 bg-emerald-400/10",
      sub: "Registered platform accounts",
    },
    {
      title: "Online Users",
      value: String(summary.onlineCount),
      icon: UserCheck,
      gradient: "from-emerald-500/5",
      iconClass: "text-emerald-400",
      badge: summary.onlineCount > 0 ? "Active Now" : "Offline",
      badgeClass: summary.onlineCount > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-zinc-400 bg-zinc-400/10",
      sub: "Live connected sessions",
    },
    {
      title: "Weekly Actions",
      value: String(summary.totalWeeklyActions),
      icon: History,
      gradient: "from-sky-500/5",
      iconClass: "text-sky-400",
      badge: "Live Telemetry",
      badgeClass: "text-sky-400 bg-sky-400/10",
      sub: "Recent platform activity",
    },
    {
      title: "Staff & Operators",
      value: `${summary.staffCount} Staff`,
      icon: UserCog,
      gradient: "from-amber-500/5",
      iconClass: "text-amber-400",
      badge: `${summary.viewerCount} Viewers`,
      badgeClass: "text-sky-400 bg-sky-400/10",
      sub: `Admins: ${summary.adminCount} · Operators: ${summary.operatorCount}`,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      {/* Clean Page Header */}
      <PageHeader
        supertitle="Administration"
        title="User Management"
        subtitle="Manage greenhouse operators, technicians, and viewer access in real-time."
      />

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card
            key={m.title}
            className="bg-card border-border shadow-md rounded-2xl overflow-hidden relative py-0"
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none",
                m.gradient
              )}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2 relative z-10 mb-4">
              <div className="flex items-center gap-2">
                <m.icon className={cn("h-3.5 w-3.5", m.iconClass)} />
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {m.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 relative z-10">
              <div className="text-2xl font-bold mb-0.5 tracking-tight">
                {m.value}
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    m.badgeClass
                  )}
                >
                  {m.badge}
                </span>
                <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Weekly Activity Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Weekly User Activity
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Total actions and automated operations recorded for the current week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyActivity}
                  margin={{ top: 8, right: 12, left: -8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {label}
                          </p>
                          <p>
                            <span className="font-semibold text-emerald-400">
                              {String(payload[0]?.value)}
                            </span>{" "}
                            <span className="text-muted-foreground">actions</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="actions"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution Pie */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Role Distribution
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Breakdown of registered users by system role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-lg">
                          <span className="font-semibold">
                            {payload[0]?.name}:
                          </span>{" "}
                          <span>{String(payload[0]?.value)}</span>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {roleDistribution.map((item) => (
                <span
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name} ({item.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                All Users
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Click any user row to view details, assign roles, and manage permissions.
              </CardDescription>
            </div>

            {/* Filters and Column Toggle Controls */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, email, role..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-56"
                />
              </div>

              {/* Column Visibility Toggle (User is unhideable) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-lg border-border hover:bg-muted cursor-pointer shrink-0"
                    title="Toggle Columns"
                  >
                    <SlidersHorizontal className="size-4 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-card border-border p-2 shadow-xl">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Toggle Columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.email}
                    onCheckedChange={() => toggleColumn("email")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Email
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.role}
                    onCheckedChange={() => toggleColumn("role")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Role
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.status}
                    onCheckedChange={() => toggleColumn("status")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.zone}
                    onCheckedChange={() => toggleColumn("zone")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Zone
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.actions}
                    onCheckedChange={() => toggleColumn("actions")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Actions / Wk
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.lastActive}
                    onCheckedChange={() => toggleColumn("lastActive")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Last Active
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  {/* User Column is Unhideable */}
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">
                    User
                  </TableHead>
                  {visibleColumns.email && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Email
                    </TableHead>
                  )}
                  {visibleColumns.role && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                      Role
                    </TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                      Status
                    </TableHead>
                  )}
                  {visibleColumns.zone && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Zone
                    </TableHead>
                  )}
                  {visibleColumns.actions && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Actions / Wk
                    </TableHead>
                  )}
                  {visibleColumns.lastActive && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest pr-6">
                      Last Active
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="py-12 text-center text-xs text-muted-foreground"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>Loading user directory...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No users found matching the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                    const online = isUserOnline(user);
                    const isProfileImg =
                      user.avatar &&
                      (user.avatar.startsWith("http") || user.avatar.startsWith("/"));

                    return (
                      <TableRow
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={cn(
                          "cursor-pointer transition-all duration-200 group border-b border-border/50",
                          selectedUser?.id === user.id
                            ? "bg-primary/10 hover:bg-primary/15 shadow-inner"
                            : "hover:bg-muted/40 active:scale-[0.997]"
                        )}
                      >
                        {/* 1. User Avatar + Name (Permanent / Unhideable) */}
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <Avatar className="size-8 border border-border">
                                {isProfileImg ? (
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="object-cover"
                                  />
                                ) : null}
                                <AvatarFallback
                                  className={cn(
                                    "bg-gradient-to-br text-[9px] font-bold text-white",
                                    user.avatarGradient
                                  )}
                                >
                                  {user.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {/* Live Online / Offline Dot */}
                              <span
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card shadow-xs transition-colors",
                                  online
                                    ? "bg-emerald-500 ring-card"
                                    : "bg-zinc-400 dark:bg-zinc-600 opacity-80"
                                )}
                                title={online ? "Online (Active session)" : "Offline"}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-none mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                                {user.fullName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Email */}
                        {visibleColumns.email && (
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {user.email}
                          </TableCell>
                        )}

                        {/* 3. Role */}
                        {visibleColumns.role && (
                          <TableCell className="text-center">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                rc.class
                              )}
                            >
                              <span className={cn("size-1.5 rounded-full", rc.dot)} />
                              {rc.label}
                            </span>
                          </TableCell>
                        )}

                        {/* 4. Status (Online vs Offline) */}
                        {visibleColumns.status && (
                          <TableCell className="text-center">
                            {online ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
                                <span className="size-1.5 rounded-full bg-zinc-400" />
                                Offline
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* 5. Zone */}
                        {visibleColumns.zone && (
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="text-[11px] font-medium bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                              {user.zone}
                            </span>
                          </TableCell>
                        )}

                        {/* 6. Actions / Wk */}
                        {visibleColumns.actions && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {user.actionsThisWeek}
                          </TableCell>
                        )}

                        {/* 7. Last Active (Formatted: MM-DD hh:mm A) */}
                        {visibleColumns.lastActive && (
                          <TableCell className="text-xs text-muted-foreground font-mono pr-6">
                            {formatLastActive(user.lastActive)}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 pt-4">
            <TablePagination
              page={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Right-Side Sheet: User Profile & Role Editing */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-card border-border p-6 overflow-y-auto z-50 flex flex-col gap-6"
        >
          <SheetHeader className="p-0 text-left space-y-1">
            <SheetTitle className="text-lg font-bold text-foreground">
              User Profile & Permissions
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Review account identity, zone access, and modify permissions in real time.
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300 fill-mode-both">
              {/* Profile Card Banner with smooth entrance */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70 shadow-xs transition-all hover:bg-muted/40 hover:border-border">
                <div className="relative shrink-0">
                  <Avatar className="size-14 border-2 border-border shadow-md transition-transform duration-300 group-hover:scale-105">
                    {selectedUser.avatar &&
                    (selectedUser.avatar.startsWith("http") || selectedUser.avatar.startsWith("/")) ? (
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.fullName} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white text-base">
                      {selectedUser.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-card shadow-xs transition-colors",
                      isUserOnline(selectedUser) ? "bg-emerald-500" : "bg-zinc-400"
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{selectedUser.fullName}</p>
                    {isUserOnline(selectedUser) ? (
                      <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        Online
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-semibold px-2 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20">
                        Offline
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{selectedUser.email}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono truncate">ID: {selectedUser.id}</p>
                </div>
              </div>

              {/* Quick Metadata Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30 hover:border-border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <MapPin className="size-3 text-primary" /> Zone Assignment
                  </span>
                  <p className="font-semibold text-foreground">{selectedUser.zone}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30 hover:border-border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <History className="size-3 text-sky-400" /> Weekly Events
                  </span>
                  <p className="font-semibold text-foreground font-mono">{selectedUser.actionsThisWeek} events</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30 hover:border-border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Clock className="size-3 text-amber-400" /> Last Active
                  </span>
                  <p className="font-semibold text-foreground font-mono">{formatLastActive(selectedUser.lastActive)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30 hover:border-border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Calendar className="size-3 text-violet-400" /> Member Since
                  </span>
                  <p className="font-semibold text-foreground font-mono">{formatLastActive(selectedUser.joinedAt)}</p>
                </div>
              </div>

              {/* Access Management Controls (Admin Only) */}
              {isAdmin ? (
                <div className="space-y-4 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <UserCog className="size-4 text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Access & Role Governance
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">System Role</Label>
                      <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                        <SelectTrigger className="h-9 text-xs bg-card border-border transition-colors focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-popover p-1 shadow-xl">
                          <SelectItem value="admin" className="text-xs py-2 rounded-lg cursor-pointer">
                            Admin (Full Control)
                          </SelectItem>
                          <SelectItem value="operator" className="text-xs py-2 rounded-lg cursor-pointer">
                            Operator (Cultivation & Overrides)
                          </SelectItem>
                          <SelectItem value="technician" className="text-xs py-2 rounded-lg cursor-pointer">
                            Technician (IoT & Schedules)
                          </SelectItem>
                          <SelectItem value="viewer" className="text-xs py-2 rounded-lg cursor-pointer">
                            Viewer (Read-Only Monitor)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Assigned Cultivation Zone</Label>
                      <Select value={editZone} onValueChange={setEditZone}>
                        <SelectTrigger className="h-9 text-xs bg-card border-border transition-colors focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-popover p-1 shadow-xl">
                          <SelectItem value="All Zones" className="text-xs py-2 rounded-lg cursor-pointer">
                            All Zones
                          </SelectItem>
                          <SelectItem value="Zone A" className="text-xs py-2 rounded-lg cursor-pointer">
                            Zone A (Incubation & Oyster A)
                          </SelectItem>
                          <SelectItem value="Zone B" className="text-xs py-2 rounded-lg cursor-pointer">
                            Zone B (Fruiting Room B)
                          </SelectItem>
                          <SelectItem value="Zone C" className="text-xs py-2 rounded-lg cursor-pointer">
                            Zone C (Substrate Colonization)
                          </SelectItem>
                          <SelectItem value="Zone D" className="text-xs py-2 rounded-lg cursor-pointer">
                            Zone D (Harvest Stage)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={updatePermissionsMutation.isPending}
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                  >
                    {updatePermissionsMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1.5" />
                        <span>Updating Permissions...</span>
                      </>
                    ) : (
                      <span>Save Role Changes</span>
                    )}
                  </Button>

                  {/* Delete User Button */}
                  <div className="pt-3 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenDelete(selectedUser)}
                      disabled={selectedUser.email.toLowerCase() === "eala.joshuamark@gmail.com"}
                      className="w-full h-9 rounded-xl text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-2 transition-all active:scale-[0.98]"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete User Account</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 flex items-start gap-2.5 text-muted-foreground text-xs">
                  <Lock className="size-4 shrink-0 text-muted-foreground/70 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Administrative privileges are required to modify user roles or delete accounts.
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete User Account Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(o) => !o && setDeletingUser(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border z-50">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              <DialogTitle className="text-base font-bold text-destructive">
                Delete User Account
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{deletingUser?.fullName}</strong> (
              <span className="font-mono">{deletingUser?.email}</span>)? This action cannot be undone and will permanently revoke their platform access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs font-medium text-foreground">
              To confirm, type <strong className="text-destructive font-mono">DELETE</strong>:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="h-10 text-xs font-mono rounded-xl bg-muted/20 border-border focus:border-destructive"
              autoFocus
            />
          </div>

          <div className="pt-3 grid grid-cols-2 gap-3 w-full border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingUser(null)}
              className="h-10 w-full rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                deleteConfirmText.trim().toUpperCase() !== "DELETE" ||
                deleteUserMutation.isPending
              }
              className="h-10 w-full rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-1.5" />
                  <span>Delete User</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
