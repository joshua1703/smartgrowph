"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  USERS,
  ROLE_CONFIG,
  STATUS_CONFIG,
  getUserSummary,
  getRoleDistribution,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  Search,
  MoreHorizontal,
  Plus,
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
import { useState, useMemo } from "react";

const summary = getUserSummary();
const roleDistribution = getRoleDistribution();
const activityByDay = getActivityByDay();

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return USERS.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredUsers, safePage, pageSize]);

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
        title="User Management"
        subtitle="Manage greenhouse operators, technicians, and viewer accounts for SmartGrow."
        actions={
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-5 gap-2">
            <Plus className="size-3.5" />
            Add User
          </Button>
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
                      const d = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                          <p className="font-semibold">
                            {d.name}: {d.value} users
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
              {roleDistribution.map((r) => (
                <span key={r.name} className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: r.fill }}
                  />
                  {r.name} ({r.value})
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
                Manage accounts, roles, and access permissions for the SmartGrow
                system.
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
                    const rc = ROLE_CONFIG[user.role];
                    const sc = STATUS_CONFIG[user.status];
                    const isOnline = user.sessionsToday > 0;
                    return (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="size-8 border border-border">
                                <AvatarFallback
                                  className={cn(
                                    "bg-gradient-to-br text-[9px] font-bold text-white",
                                    user.avatarGradient
                                  )}
                                >
                                  {user.avatar}
                                </AvatarFallback>
                              </Avatar>
                              {isOnline && (
                                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground leading-none">
                                {user.fullName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {user.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={cn("size-1.5 rounded-full", rc.dot)}
                            />
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider border",
                                rc.class
                              )}
                            >
                              {rc.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-wider border",
                              sc.class
                            )}
                          >
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {user.zone}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          {user.actionsThisWeek}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(user.lastActive).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            itemLabel="users"
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
