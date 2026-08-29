"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  USERS,
  ROLE_CONFIG,
  STATUS_CONFIG,
  getActivityByDay,
} from "@/data/users";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  Search,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sprout,
  Wrench,
  Eye,
  CheckCircle2,
  Lock,
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
import { useState, useMemo, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import type { SystemUser, UserRole, UserStatus } from "@/data/users";
import { toast } from "sonner";
import { useUserRole } from "@/lib/use-user-role";

const ROLE_PERMISSIONS_INFO = [
  {
    role: "admin" as const,
    title: "Administrator",
    icon: ShieldCheck,
    color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    badge: "Full Control",
    description:
      "Full administrative governance. Manage user roles, invite team members, adjust global climate setpoints, and override all IoT actuators.",
    permissions: [
      "Manage all user roles & account statuses",
      "Edit system setpoints & climate targets",
      "Manual emergency override on all hardware",
      "Manage all cultivation batches & automations",
    ],
  },
  {
    role: "operator" as const,
    title: "Cultivation Operator",
    icon: Sprout,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    badge: "Operations",
    description:
      "Responsible for oyster mushroom cultivation batches, monitoring fruiting stages, triggering manual misting/fans, and logging harvests.",
    permissions: [
      "Create & advance cultivation batches",
      "Log harvest yields & contamination reports",
      "Trigger manual misting & exhaust fan cycles",
      "View sensor telemetry & daily metrics",
    ],
  },
  {
    role: "technician" as const,
    title: "IoT Technician",
    icon: Wrench,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    badge: "Hardware & IoT",
    description:
      "Manages hardware sensors (DHT22, ESP32), actuator relays, automations, and scheduled device timers. Inspects hardware error logs.",
    permissions: [
      "Configure automation rules & thresholds",
      "Manage scheduled device photoperiods",
      "Perform actuator diagnostics & calibration",
      "Inspect telemetry & hardware error logs",
    ],
  },
  {
    role: "viewer" as const,
    title: "Viewer (Default for New Users)",
    icon: Eye,
    color: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    badge: "Read-Only",
    description:
      "Auditor and observer role assigned automatically to newly registered accounts. Can view live environment metrics with control actions locked.",
    permissions: [
      "Monitor real-time DHT22 sensor readings",
      "Inspect growth progress & harvest charts",
      "View greenhouse logs and alerts",
      "Read-only (control actions disabled)",
    ],
  },
];

export default function UsersPage() {
  const { role: currentUserRole, isAdmin } = useUserRole();
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit User Dialog State
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("viewer");
  const [editStatus, setEditStatus] = useState<UserStatus>("active");
  const [editZone, setEditZone] = useState<string>("All Zones");
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadLiveUsers() {
    try {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // Exclude dummy sample seed users so only real registered accounts appear
        const realUsers = data.filter(
          (u) => !u.id.startsWith("USR-") && !u.email.endsWith("@smartgrow.io")
        );

        const mapped: SystemUser[] = realUsers.map((u) => {
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
        setUsersList(mapped);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.warn("Error loading users:", err);
      setUsersList([]);
    }
  }

  useEffect(() => {
    loadLiveUsers();
  }, []);

  const summary = useMemo(() => {
    const total = usersList.length;
    const active = usersList.filter((u) => u.status === "active").length;
    const onlineToday = usersList.filter((u) => u.sessionsToday > 0).length;
    const totalActions = usersList.reduce((sum, u) => sum + u.actionsThisWeek, 0);
    return { total, active, onlineToday, totalActions };
  }, [usersList]);

  const roleDistribution = useMemo(() => {
    return [
      { name: "Admin", value: usersList.filter((u) => u.role === "admin").length, fill: "#a855f7" },
      { name: "Operator", value: usersList.filter((u) => u.role === "operator").length, fill: "#10b981" },
      { name: "Technician", value: usersList.filter((u) => u.role === "technician").length, fill: "#f59e0b" },
      { name: "Viewer", value: usersList.filter((u) => u.role === "viewer").length, fill: "#38bdf8" },
    ];
  }, [usersList]);

  const activityByDay = useMemo(() => getActivityByDay(), []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return usersList.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredUsers, safePage, pageSize]);

  // Open Edit User Modal
  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditZone(user.zone);
  };

  // Save Role / Status Changes to Supabase
  const handleSaveUserPermissions = async () => {
    if (!editingUser) return;
    setIsUpdating(true);

    try {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const { error } = await supabase
        .from("users")
        .update({
          role: editRole,
          status: editStatus,
          zone: editZone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingUser.id);

      if (error) {
        toast.error(`Failed to update permissions: ${error.message}`);
      } else {
        toast.success(`Updated ${editingUser.fullName}'s role to ${editRole.toUpperCase()}`);
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? { ...u, role: editRole, status: editStatus, zone: editZone }
              : u
          )
        );
        setEditingUser(null);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("An error occurred while saving user permissions.");
    } finally {
      setIsUpdating(false);
    }
  };

  const metrics = [
    {
      title: "Total Users",
      value: String(summary.total),
      icon: Users,
      gradient: "from-violet-500/5",
      iconClass: "text-violet-400",
      badge: `${summary.active} Active`,
      badgeClass: "text-emerald-400 bg-emerald-400/10",
      sub: "Registered accounts",
    },
    {
      title: "Online Today",
      value: String(summary.onlineToday),
      icon: UserCheck,
      gradient: "from-emerald-500/5",
      iconClass: "text-emerald-400",
      badge: "Sessions Active",
      badgeClass: "text-emerald-400 bg-emerald-400/10",
      sub: "Logged in today",
    },
    {
      title: "Weekly Actions",
      value: String(summary.totalActions),
      icon: Activity,
      gradient: "from-sky-500/5",
      iconClass: "text-sky-400",
      badge: "All Roles",
      badgeClass: "text-sky-400 bg-sky-400/10",
      sub: "Sensor checks, overrides, logs",
    },
    {
      title: "System Roles",
      value: "4 Types",
      icon: Shield,
      gradient: "from-amber-500/5",
      iconClass: "text-amber-400",
      badge: "RBAC Enabled",
      badgeClass: "text-amber-400 bg-amber-400/10",
      sub: "Admin, Operator, Tech, Viewer",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Administration"
        title="User Management & Access Control"
        subtitle="Manage greenhouse operators, technicians, and viewer permissions across SmartGrow."
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-mono py-1 px-3 border-border">
              Your Role: <span className="font-bold text-primary ml-1 uppercase">{currentUserRole}</span>
            </Badge>
          </div>
        }
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
              Total actions performed by all users per day — sensor checks, actuator overrides, and log views.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityByDay}
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
                            <span
                              className="font-semibold"
                              style={{ color: "#10b981" }}
                            >
                              {String(payload[0]?.value)}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              actions
                            </span>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                All Users
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Manage accounts, roles, and access permissions for the SmartGrow system.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">
                    User
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                    Email
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                    Role
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                    Zone
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                    Actions / Wk
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                    Last Active
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center pr-6">
                    Manage
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No users found matching the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => {
                    const rc = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                    const sc = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
                    const isOnline = user.sessionsToday > 0;
                    const isProfileImg =
                      user.avatar &&
                      (user.avatar.startsWith("http") || user.avatar.startsWith("/"));

                    return (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="relative">
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
                              {isOnline && (
                                <span
                                  className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-card"
                                  title="Online today"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground leading-none mb-1">
                                {user.fullName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {user.email}
                        </TableCell>
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
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              sc.class
                            )}
                          >
                            <span className={cn("size-1.5 rounded-full", sc.dot)} />
                            {sc.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="text-[11px] font-medium bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                            {user.zone}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                          {user.actionsThisWeek}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(user.lastActive).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 hover:bg-muted text-muted-foreground"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuLabel className="text-xs">User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(user)}
                                className="text-xs font-semibold cursor-pointer"
                              >
                                Edit Role & Permissions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
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

      {/* Role Significance & RBAC Matrix Cards */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight">
            Role Significance & Permission Governance
          </h3>
          <p className="text-xs text-muted-foreground">
            Overview of functional capabilities assigned to each role within the SmartGrow greenhouse platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ROLE_PERMISSIONS_INFO.map((info) => {
            const Icon = info.icon;
            return (
              <Card
                key={info.role}
                className="bg-card border-border shadow-xs rounded-2xl p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn("size-9 rounded-xl flex items-center justify-center border", info.color)}>
                      <Icon className="size-4.5" />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", info.color)}>
                      {info.badge}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">
                      {info.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {info.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Capabilities
                  </p>
                  <ul className="space-y-1">
                    {info.permissions.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Role & Permissions Modal */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Modify User Role & Access
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update access tier and privileges for {editingUser?.fullName} ({editingUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">System Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (Full Control)</SelectItem>
                  <SelectItem value="operator">Operator (Cultivation & Manual Overrides)</SelectItem>
                  <SelectItem value="technician">Technician (IoT & Schedules)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read-Only Monitor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Account Status</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v as UserStatus)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Full access permitted)</SelectItem>
                  <SelectItem value="inactive">Inactive (Temporary hiatus)</SelectItem>
                  <SelectItem value="suspended">Suspended (Access blocked)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Cultivation Zone</Label>
              <Select value={editZone} onValueChange={setEditZone}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Zones">All Zones</SelectItem>
                  <SelectItem value="Zone A">Zone A (Incubation & Oyster A)</SelectItem>
                  <SelectItem value="Zone B">Zone B (Fruiting Room B)</SelectItem>
                  <SelectItem value="Zone C">Zone C (Substrate Colonization)</SelectItem>
                  <SelectItem value="Zone D">Zone D (Harvest Stage)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingUser(null)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveUserPermissions}
              disabled={isUpdating}
              className="text-xs rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUpdating ? "Updating..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
