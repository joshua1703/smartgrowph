export type UserRole = "admin" | "operator" | "viewer" | "technician";
export type UserStatus = "active" | "inactive" | "suspended";

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  avatarGradient: string;
  zone: string;
  lastActive: string;
  joinedAt: string;
  sessionsToday: number;
  actionsThisWeek: number;
}

export const ROLE_CONFIG: Record<UserRole, { label: string; class: string; dot: string }> = {
  admin:      { label: "Admin",      class: "text-violet-400 bg-violet-400/10 border-violet-400/20",    dot: "bg-violet-400" },
  operator:   { label: "Operator",   class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  viewer:     { label: "Viewer",     class: "text-sky-400 bg-sky-400/10 border-sky-400/20",             dot: "bg-sky-400" },
  technician: { label: "Technician", class: "text-amber-400 bg-amber-400/10 border-amber-400/20",       dot: "bg-amber-400" },
};

export const STATUS_CONFIG: Record<UserStatus, { label: string; class: string; dot: string }> = {
  active:    { label: "Active",    class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  inactive:  { label: "Inactive",  class: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",         dot: "bg-zinc-400" },
  suspended: { label: "Suspended", class: "text-rose-400 bg-rose-400/10 border-rose-400/20",         dot: "bg-rose-400" },
};

// No dummy users — live database population only
export const USERS: SystemUser[] = [];

export function getUserSummary(users: SystemUser[] = USERS) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const onlineToday = users.filter((u) => u.sessionsToday > 0).length;
  const totalActions = users.reduce((sum, u) => sum + u.actionsThisWeek, 0);
  return { total, active, onlineToday, totalActions };
}

export function getRoleDistribution(users: SystemUser[] = USERS) {
  return [
    { name: "Admin", value: users.filter((u) => u.role === "admin").length, fill: "#a855f7" },
    { name: "Operator", value: users.filter((u) => u.role === "operator").length, fill: "#10b981" },
    { name: "Technician", value: users.filter((u) => u.role === "technician").length, fill: "#f59e0b" },
    { name: "Viewer", value: users.filter((u) => u.role === "viewer").length, fill: "#38bdf8" },
  ];
}

export function getActivityByDay() {
  return [
    { day: "Mon", actions: 4 },
    { day: "Tue", actions: 7 },
    { day: "Wed", actions: 3 },
    { day: "Thu", actions: 8 },
    { day: "Fri", actions: 12 },
    { day: "Sat", actions: 2 },
    { day: "Sun", actions: 1 },
  ];
}
