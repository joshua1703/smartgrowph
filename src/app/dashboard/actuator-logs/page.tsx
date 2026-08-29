"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database, ActuatorType, ActuatorAction, ActuatorTrigger } from "@/lib/supabase/types";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  ACTUATOR_LOGS as FALLBACK_LOGS,
  getActuatorSummary as getFallbackSummary,
  getActuatorTypeBreakdown as getFallbackTypeBreakdown,
  getDailyEventCounts as getFallbackDailyCounts,
  ActuatorLog,
} from "@/data/actuator-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  Fan,
  Bot,
  AlertOctagon,
  Clock,
  Cpu,
  Search,
  SlidersHorizontal,
  MapPin,
  Power,
  Gauge,
  Timer,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const actionConfig = {
  activated: { label: "Activated", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  deactivated: { label: "Deactivated", class: "text-sky-400 bg-sky-400/10 border-sky-400/20", dot: "bg-sky-400" },
  error: { label: "Error", class: "text-rose-400 bg-rose-400/10 border-rose-400/20", dot: "bg-rose-400" },
  maintenance: { label: "Maintenance", class: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400" },
};

const triggerConfig = {
  auto: { label: "Auto", class: "text-emerald-400 bg-emerald-400/10" },
  manual: { label: "Manual", class: "text-sky-400 bg-sky-400/10" },
  schedule: { label: "Scheduled", class: "text-violet-400 bg-violet-400/10" },
  emergency: { label: "Emergency", class: "text-rose-400 bg-rose-400/10" },
};

const actuatorTypeIcons: Record<string, string> = {
  fan: "💨",
  fogger: "🌫️",
  sprinkler: "💧",
  led: "💡",
};

function formatTimestamp(dateStr: string): string {
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

type OptionalActuatorColumn =
  | "actuator"
  | "zone"
  | "action"
  | "trigger"
  | "duration"
  | "power"
  | "reason";

export default function ActuatorLogsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<ActuatorLog | null>(null);

  // Column Visibility Toggle State (Timestamp is unhideable)
  const [visibleColumns, setVisibleColumns] = useState<Record<OptionalActuatorColumn, boolean>>({
    actuator: true,
    zone: true,
    action: true,
    trigger: true,
    duration: true,
    power: true,
    reason: true,
  });

  const toggleColumn = (key: OptionalActuatorColumn) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleColumnCount = useMemo(() => {
    return 1 + Object.values(visibleColumns).filter(Boolean).length;
  }, [visibleColumns]);

  // 1. TanStack Query: Fetch Actuator Logs from Supabase PostgreSQL
  const { data: logs = [] } = useQuery<ActuatorLog[]>({
    queryKey: ["actuator-logs"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("actuator_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error || !data) {
        return [];
      }

      return data.map((l) => ({
        id: l.id,
        timestamp: l.created_at,
        actuatorId: l.actuator_id,
        actuatorName: l.actuator_name,
        actuatorType: l.actuator_type as ActuatorType,
        zone: l.zone,
        action: l.action as ActuatorAction,
        trigger: l.trigger as ActuatorTrigger,
        duration: l.duration ?? null,
        powerConsumption: l.power_consumption,
        reason: l.reason,
      }));
    },
    refetchInterval: 4000,
  });

  // 2. Supabase Realtime Subscription: Instant live updates on new actuator event logs
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `actuator-logs-sync-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "actuator_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["actuator-logs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Compute live daily events from database logs
  const dailyCounts = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = days.map((day) => ({ day, activations: 0, deactivations: 0, errors: 0 }));

    logs.forEach((l) => {
      const d = new Date(l.timestamp);
      if (!isNaN(d.getTime())) {
        const dayIdx = (d.getDay() + 6) % 7;
        if (l.action === "activated") counts[dayIdx].activations++;
        else if (l.action === "deactivated") counts[dayIdx].deactivations++;
        else if (l.action === "error") counts[dayIdx].errors++;
      }
    });

    return counts;
  }, [logs]);

  // Compute live actuator type distribution from database logs
  const typeBreakdown = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const map: Record<string, number> = { fan: 0, fogger: 0, sprinkler: 0, led: 0 };
    logs.forEach((l) => {
      if (map[l.actuatorType] !== undefined) {
        map[l.actuatorType]++;
      }
    });

    return [
      { name: "Ventilation Fans", value: map.fan, fill: "#10b981" },
      { name: "Ultrasonic Foggers", value: map.fogger, fill: "#38bdf8" },
      { name: "Misting Sprinklers", value: map.sprinkler, fill: "#a855f7" },
      { name: "LED Grow Lights", value: map.led, fill: "#fbbf24" },
    ].filter((t) => t.value > 0);
  }, [logs]);

  // Dynamic Metrics derived from database records
  const metrics = useMemo(() => {
    const totalEvents = logs.length;
    const hasLogs = totalEvents > 0;
    const autoCount = logs.filter((l) => l.trigger === "auto").length;
    const autoPercent = hasLogs ? Math.round((autoCount / totalEvents) * 100) : null;
    const totalRuntime = logs.reduce((acc, l) => acc + (l.duration || 0), 0);
    const avgPower = hasLogs ? Math.round(logs.reduce((acc, l) => acc + l.powerConsumption, 0) / totalEvents) : null;
    const errors = logs.filter((l) => l.action === "error").length;

    return [
      {
        title: "Total Events",
        value: String(totalEvents),
        icon: Cpu,
        gradient: "from-sky-500/5",
        iconClass: "text-sky-400",
        badge: `${errors} Errors`,
        badgeClass: errors > 0 ? "text-rose-400 bg-rose-400/10" : "text-emerald-400 bg-emerald-400/10",
        sub: "Database log rows",
      },
      {
        title: "Automation Rate",
        value: autoPercent !== null ? `${autoPercent}%` : "—",
        icon: Bot,
        gradient: "from-emerald-500/5",
        iconClass: "text-emerald-400",
        badge: autoPercent !== null && autoPercent >= 70 ? "High Efficiency" : hasLogs ? "Manual Heavy" : "No Logs",
        badgeClass: autoPercent !== null && autoPercent >= 70 ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10",
        sub: "Auto-triggered actions",
      },
      {
        title: "Est. Runtime",
        value: `${(totalRuntime / 60).toFixed(1)}h`,
        icon: Clock,
        gradient: "from-purple-500/5",
        iconClass: "text-purple-400",
        badge: "Active Time",
        badgeClass: "text-purple-400 bg-purple-400/10",
        sub: "Recorded operation hours",
      },
      {
        title: "Avg Power Load",
        value: avgPower !== null ? `${avgPower}W` : "—",
        icon: Gauge,
        gradient: "from-amber-500/5",
        iconClass: "text-amber-400",
        badge: "Per Device",
        badgeClass: "text-amber-400 bg-amber-400/10",
        sub: "Active relay load average",
      },
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      return (
        l.actuatorName.toLowerCase().includes(q) ||
        l.actuatorType.toLowerCase().includes(q) ||
        l.zone.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.trigger.toLowerCase().includes(q) ||
        l.reason.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      );
    });
  }, [logs, query]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredLogs, safePage, pageSize]);

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Hardware"
        title="Actuator Logs"
        subtitle="Operational event logs, automated rule triggers, runtimes, and diagnostics stream directly from database tables."
      />

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.title} className="bg-card border-border shadow-md rounded-2xl overflow-hidden relative py-0">
            <div className={cn("absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none", m.gradient)} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2 relative z-10 mb-4">
              <div className="flex items-center gap-2">
                <m.icon className={cn("h-3.5 w-3.5", m.iconClass)} />
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 relative z-10">
              <div className="text-2xl font-bold mb-0.5 tracking-tight">{m.value}</div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", m.badgeClass)}>{m.badge}</span>
                <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Daily Events Stacked Bar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Daily Actuator Events (Database Records)
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Activation, deactivation, and error events calculated from real-time database logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
                <Cpu className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">No actuator events logged in database yet</p>
                <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                  Relay actions, fan triggers, and misting operations will log here automatically.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyCounts} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 9 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                              {payload.map((p) => (
                                <p key={String(p.dataKey)}>
                                  <span className="font-semibold" style={{ color: String(p.color) }}>{String(p.value)}</span>{" "}
                                  <span className="text-muted-foreground">{String(p.dataKey)}</span>
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="activations" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="deactivations" stackId="a" fill="#38bdf8" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="errors" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" /> Activations
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-sky-400" /> Deactivations
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500" /> Errors
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actuator Type Breakdown Pie */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Actuator Type Breakdown
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Distribution of logged events by actuator type from database records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {typeBreakdown.length === 0 ? (
              <div className="h-[220px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
                <Cpu className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">No events recorded in database</p>
                <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                  Distribution will display once relay commands are logged in Supabase.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {typeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-lg">
                              <span className="font-semibold">{data.name}:</span>{" "}
                              <span>{data.value} events</span>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
                  {typeBreakdown.map((t) => (
                    <span key={t.name} className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ background: t.fill }} />
                      {t.name} ({t.value})
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actuator Logs Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Recent Event Logs
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Live database event history. Click any row to inspect execution telemetry.
              </CardDescription>
            </div>

            {/* Standardized Search & Column Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search actuator, zone, reason..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-56"
                />
              </div>

              {/* Column Visibility Toggle */}
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
                    checked={visibleColumns.actuator}
                    onCheckedChange={() => toggleColumn("actuator")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Actuator Name
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.zone}
                    onCheckedChange={() => toggleColumn("zone")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Zone
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.action}
                    onCheckedChange={() => toggleColumn("action")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Action
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.trigger}
                    onCheckedChange={() => toggleColumn("trigger")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Trigger Type
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.duration}
                    onCheckedChange={() => toggleColumn("duration")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Duration
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.power}
                    onCheckedChange={() => toggleColumn("power")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Power Consumption
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.reason}
                    onCheckedChange={() => toggleColumn("reason")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Event Reason
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
                  {/* Timestamp is Unhideable */}
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">
                    Timestamp
                  </TableHead>
                  {visibleColumns.actuator && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Actuator
                    </TableHead>
                  )}
                  {visibleColumns.zone && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Zone
                    </TableHead>
                  )}
                  {visibleColumns.action && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                      Action
                    </TableHead>
                  )}
                  {visibleColumns.trigger && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                      Trigger
                    </TableHead>
                  )}
                  {visibleColumns.duration && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Duration
                    </TableHead>
                  )}
                  {visibleColumns.power && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Power
                    </TableHead>
                  )}
                  {visibleColumns.reason && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest pr-6">
                      Reason
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No actuator logs found matching the query.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((l) => {
                    const ac = actionConfig[l.action] || { label: l.action, class: "text-muted-foreground", dot: "bg-muted-foreground" };
                    const tc = triggerConfig[l.trigger] || { label: l.trigger, class: "text-muted-foreground" };
                    return (
                      <TableRow
                        key={l.id}
                        onClick={() => setSelectedLog(l)}
                        className={cn(
                          "cursor-pointer transition-all duration-200 group border-b border-border/50",
                          selectedLog?.id === l.id
                            ? "bg-primary/10 hover:bg-primary/15 shadow-inner"
                            : "hover:bg-muted/40 active:scale-[0.997]"
                        )}
                      >
                        {/* 1. Timestamp (Unhideable) */}
                        <TableCell className="text-xs font-mono text-muted-foreground pl-6 py-3">
                          {formatTimestamp(l.timestamp)}
                        </TableCell>

                        {/* 2. Actuator Name */}
                        {visibleColumns.actuator && (
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{actuatorTypeIcons[l.actuatorType] || "⚡"}</span>
                              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                {l.actuatorName}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {/* 3. Zone */}
                        {visibleColumns.zone && (
                          <TableCell>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {l.zone}
                            </span>
                          </TableCell>
                        )}

                        {/* 4. Action */}
                        {visibleColumns.action && (
                          <TableCell className="text-center">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                ac.class
                              )}
                            >
                              <span className={cn("size-1.5 rounded-full", ac.dot)} />
                              {ac.label}
                            </span>
                          </TableCell>
                        )}

                        {/* 5. Trigger */}
                        {visibleColumns.trigger && (
                          <TableCell className="text-center">
                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", tc.class)}>
                              {tc.label}
                            </span>
                          </TableCell>
                        )}

                        {/* 6. Duration */}
                        {visibleColumns.duration && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {l.duration != null ? `${l.duration}m` : "—"}
                          </TableCell>
                        )}

                        {/* 7. Power */}
                        {visibleColumns.power && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {l.powerConsumption}W
                          </TableCell>
                        )}

                        {/* 8. Reason */}
                        {visibleColumns.reason && (
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate pr-6">
                            {l.reason}
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
              totalItems={filteredLogs.length}
              itemLabel="logs"
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Right-Side Sheet Drawer: Actuator Log Details */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-card border-border p-6 overflow-y-auto z-50 flex flex-col gap-6"
        >
          <SheetHeader className="p-0 text-left space-y-1">
            <SheetTitle className="text-lg font-bold text-foreground">
              Actuator Event Detail
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Hardware relay activation parameters, runtime duration, and power consumption from database.
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300 fill-mode-both">
              {/* Event Banner Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70 shadow-xs">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
                  {actuatorTypeIcons[selectedLog.actuatorType] || "⚡"}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{selectedLog.actuatorName}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider border",
                        actionConfig[selectedLog.action]?.class
                      )}
                    >
                      {actionConfig[selectedLog.action]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{selectedLog.zone}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono truncate">ID: {selectedLog.id}</p>
                </div>
              </div>

              {/* 2x2 Metric Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Clock className="size-3 text-primary" /> Event Time
                  </span>
                  <p className="font-semibold text-foreground font-mono text-xs">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Gauge className="size-3 text-amber-400" /> Power Load
                  </span>
                  <p className="font-semibold text-foreground font-mono text-xs">{selectedLog.powerConsumption}W active</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Timer className="size-3 text-sky-400" /> Runtime Duration
                  </span>
                  <p className="font-semibold text-foreground font-mono text-xs">
                    {selectedLog.duration != null ? `${selectedLog.duration} minutes` : "Instantaneous"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Cpu className="size-3 text-violet-400" /> Trigger Mode
                  </span>
                  <p className="font-semibold text-foreground font-mono text-xs capitalize">{selectedLog.trigger}</p>
                </div>
              </div>

              {/* Event Execution Reason */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/60 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 text-primary" /> Trigger Log & Diagnostic
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                  {selectedLog.reason}
                </p>
                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">Relay State:</span>{" "}
                    <p className="font-mono mt-0.5 text-emerald-400 font-bold uppercase">{selectedLog.action}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Target Zone:</span>{" "}
                    <p className="font-mono mt-0.5">{selectedLog.zone}</p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedLog(null)}
                className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Log
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
