"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  ACTUATOR_LOGS,
  getActuatorSummary,
  getActuatorTypeBreakdown,
  getDailyEventCounts,
} from "@/data/actuator-logs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Fan,
  Zap,
  AlertOctagon,
  Clock,
  Cpu,
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
import { useState, useMemo } from "react";
import { TablePagination } from "@/components/dashboard/table-pagination";

const summary = getActuatorSummary();
const typeBreakdown = getActuatorTypeBreakdown();
const dailyCounts = getDailyEventCounts();

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

export default function ActuatorLogsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredLogs = useMemo(() => {
    return ACTUATOR_LOGS
      .filter((l) => typeFilter === "all" || l.actuatorType === typeFilter)
      .filter((l) => actionFilter === "all" || l.action === actionFilter);
  }, [typeFilter, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredLogs, safePage, pageSize]);

  const metrics = [
    {
      title: "Total Events",
      value: String(summary.totalEvents),
      icon: Cpu,
      gradient: "from-sky-500/5",
      iconClass: "text-sky-400",
      badge: `${summary.autoPercent}% Automated`,
      badgeClass: "text-emerald-400 bg-emerald-400/10",
      sub: "Last 7 days",
    },
    {
      title: "Total Runtime",
      value: `${Math.round(summary.totalRuntime / 60)}h ${summary.totalRuntime % 60}m`,
      icon: Clock,
      gradient: "from-violet-500/5",
      iconClass: "text-violet-400",
      badge: "All Actuators",
      badgeClass: "text-violet-400 bg-violet-400/10",
      sub: "Cumulative logged time",
    },
    {
      title: "Avg Power",
      value: `${summary.avgPower}W`,
      icon: Zap,
      gradient: "from-amber-500/5",
      iconClass: "text-amber-400",
      badge: "Per Event",
      badgeClass: "text-amber-400 bg-amber-400/10",
      sub: "Average consumption",
    },
    {
      title: "Errors",
      value: String(summary.errors),
      icon: AlertOctagon,
      gradient: "from-rose-500/5",
      iconClass: "text-rose-400",
      badge: summary.errors === 0 ? "All Clear" : "Needs Attention",
      badgeClass: summary.errors === 0
        ? "text-emerald-400 bg-emerald-400/10"
        : "text-rose-400 bg-rose-400/10",
      sub: "Last 7 days",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Monitoring"
        title="Actuator Logs"
        subtitle="Event history for fans, foggers, sprinklers, and LED grow lights controlled by the ESP32."
      />

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.title} className="bg-card border-border shadow-md rounded-2xl overflow-hidden relative group py-0">
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

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Daily Events Stacked Bar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Daily Actuator Events
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Activation, deactivation, and error events per day over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Actuator Type Breakdown Pie */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Actuator Type Breakdown
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Distribution of events by actuator type.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      const d = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                          <p className="font-semibold">{d.name}: {d.value} events</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
              {typeBreakdown.map((t) => (
                <span key={t.name} className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: t.fill }} />
                  {t.name} ({t.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Event Log
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Detailed actuator event history — showing latest 50 entries.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fan">Fan</SelectItem>
                  <SelectItem value="fogger">Fogger</SelectItem>
                  <SelectItem value="sprinkler">Sprinkler</SelectItem>
                  <SelectItem value="led">LED Light</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="activated">Activated</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Time</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Actuator</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Zone</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Action</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Trigger</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Duration</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Power</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No actuator logs found matching the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((l) => {
                    const ac = actionConfig[l.action];
                    const tc = triggerConfig[l.trigger];
                    return (
                      <TableRow key={l.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {new Date(l.timestamp).toLocaleString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{actuatorTypeIcons[l.actuatorType]}</span>
                            <span className="text-xs font-semibold">{l.actuatorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {l.zone}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={cn("size-1.5 rounded-full", ac.dot)} />
                            <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider border", ac.class)}>
                              {ac.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md", tc.class)}>
                            {tc.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          {l.duration != null ? `${l.duration}m` : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">
                          {l.powerConsumption}W
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {l.reason}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
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
    </div>
  );
}
