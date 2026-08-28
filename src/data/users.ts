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

export const USERS: SystemUser[] = [
  { id: "USR-001", fullName: "Koji Kiyotaka", email: "koji.kiyotaka@smartgrow.io", role: "admin", status: "active", avatar: "KK", avatarGradient: "from-violet-500 to-purple-600", zone: "All Zones", lastActive: "2026-06-27T09:12:00+08:00", joinedAt: "2025-11-10T08:00:00+08:00", sessionsToday: 3, actionsThisWeek: 47 },
  { id: "USR-002", fullName: "Maria Santos", email: "maria.santos@smartgrow.io", role: "operator", status: "active", avatar: "MS", avatarGradient: "from-emerald-500 to-teal-600", zone: "Zone A", lastActive: "2026-06-27T08:45:00+08:00", joinedAt: "2026-01-15T08:00:00+08:00", sessionsToday: 2, actionsThisWeek: 31 },
  { id: "USR-003", fullName: "Carlos Reyes", email: "carlos.reyes@smartgrow.io", role: "technician", status: "active", avatar: "CR", avatarGradient: "from-amber-500 to-orange-600", zone: "Zone B", lastActive: "2026-06-27T07:30:00+08:00", joinedAt: "2026-02-20T08:00:00+08:00", sessionsToday: 1, actionsThisWeek: 18 },
  { id: "USR-004", fullName: "Angela Cruz", email: "angela.cruz@smartgrow.io", role: "operator", status: "active", avatar: "AC", avatarGradient: "from-sky-500 to-cyan-600", zone: "Zone C", lastActive: "2026-06-26T16:20:00+08:00", joinedAt: "2026-03-05T08:00:00+08:00", sessionsToday: 0, actionsThisWeek: 22 },
  { id: "USR-005", fullName: "James Villanueva", email: "james.v@smartgrow.io", role: "viewer", status: "active", avatar: "JV", avatarGradient: "from-sky-400 to-blue-500", zone: "Zone A", lastActive: "2026-06-26T14:10:00+08:00", joinedAt: "2026-04-12T08:00:00+08:00", sessionsToday: 0, actionsThisWeek: 5 },
  { id: "USR-006", fullName: "Rina Dela Peña", email: "rina.dp@smartgrow.io", role: "technician", status: "inactive", avatar: "RD", avatarGradient: "from-rose-500 to-pink-600", zone: "Zone D", lastActive: "2026-06-20T11:00:00+08:00", joinedAt: "2026-01-28T08:00:00+08:00", sessionsToday: 0, actionsThisWeek: 0 },
  { id: "USR-007", fullName: "Paolo Garcia", email: "paolo.garcia@smartgrow.io", role: "viewer", status: "active", avatar: "PG", avatarGradient: "from-teal-400 to-emerald-500", zone: "Zone B", lastActive: "2026-06-27T09:01:00+08:00", joinedAt: "2026-05-01T08:00:00+08:00", sessionsToday: 1, actionsThisWeek: 8 },
  { id: "USR-008", fullName: "Sofia Lim", email: "sofia.lim@smartgrow.io", role: "operator", status: "suspended", avatar: "SL", avatarGradient: "from-zinc-500 to-gray-600", zone: "Zone A", lastActive: "2026-06-10T09:30:00+08:00", joinedAt: "2025-12-01T08:00:00+08:00", sessionsToday: 0, actionsThisWeek: 0 },
];

export function getUserSummary() {
  const total = USERS.length;
  const active = USERS.filter((u) => u.status === "active").length;
  const onlineToday = USERS.filter((u) => u.sessionsToday > 0).length;
  const totalActions = USERS.reduce((sum, u) => sum + u.actionsThisWeek, 0);
  return { total, active, onlineToday, totalActions };
}

export function getRoleDistribution() {
  return [
    { name: "Admin", value: USERS.filter((u) => u.role === "admin").length, fill: "#a855f7" },
    { name: "Operator", value: USERS.filter((u) => u.role === "operator").length, fill: "#10b981" },
    { name: "Technician", value: USERS.filter((u) => u.role === "technician").length, fill: "#f59e0b" },
    { name: "Viewer", value: USERS.filter((u) => u.role === "viewer").length, fill: "#38bdf8" },
  ];
}

export function getActivityByDay() {
  return [
    { day: "Mon", actions: 28 },
    { day: "Tue", actions: 35 },
    { day: "Wed", actions: 22 },
    { day: "Thu", actions: 31 },
    { day: "Fri", actions: 40 },
    { day: "Sat", actions: 12 },
    { day: "Sun", actions: 8 },
  ];
}
