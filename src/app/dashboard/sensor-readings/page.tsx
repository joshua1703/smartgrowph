"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  SENSOR_READINGS,
  getSensorSummary,
  getLast24HoursAvg,
} from "@/data/sensor-readings";
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
  Thermometer,
  Droplets,
  AlertTriangle,
  Activity,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useMemo } from "react";
import { TablePagination } from "@/components/dashboard/table-pagination";

const summary = getSensorSummary();
const hourlyData = getLast24HoursAvg();

const TEMP_COLOR = "#ef4444";
const HUMIDITY_COLOR = "#38bdf8";
const CO2_COLOR = "#a855f7";

const statusConfig = {
  normal: { label: "Normal", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  warning: { label: "Warning", class: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  critical: { label: "Critical", class: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

interface TooltipPayloadItem {
  payload?: {
    temperature: number;
    humidity: number;
    co2: number;
  };
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipPayloadItem>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="space-y-0.5">
        <p>
          <span className="font-semibold" style={{ color: TEMP_COLOR }}>{row.temperature}°C</span>{" "}
          <span className="text-muted-foreground">temperature</span>
        </p>
        <p>
          <span className="font-semibold" style={{ color: HUMIDITY_COLOR }}>{row.humidity}%</span>{" "}
          <span className="text-muted-foreground">humidity</span>
        </p>
        <p>
          <span className="font-semibold" style={{ color: CO2_COLOR }}>{row.co2} ppm</span>{" "}
          <span className="text-muted-foreground">CO₂</span>
        </p>
      </div>
    </div>
  );
}

export default function SensorReadingsPage() {
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredReadings = useMemo(() => {
    return SENSOR_READINGS
      .filter((r) => zoneFilter === "all" || r.zone === zoneFilter)
      .filter((r) => statusFilter === "all" || r.status === statusFilter);
  }, [zoneFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReadings.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedReadings = useMemo(() => {
    return filteredReadings.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredReadings, safePage, pageSize]);

  const metrics = [
    {
      title: "Avg Temperature",
      value: `${summary.avgTemp}°C`,
      icon: Thermometer,
      gradient: "from-rose-500/5",
      iconClass: "text-rose-400",
      badge: summary.avgTemp >= 24 && summary.avgTemp <= 28 ? "Optimal" : "Check Range",
      badgeClass: summary.avgTemp >= 24 && summary.avgTemp <= 28
        ? "text-emerald-400 bg-emerald-400/10"
        : "text-amber-400 bg-amber-400/10",
      sub: "Latest readings average",
    },
    {
      title: "Avg Humidity",
      value: `${summary.avgHumidity}% RH`,
      icon: Droplets,
      gradient: "from-sky-500/5",
      iconClass: "text-sky-400",
      badge: summary.avgHumidity >= 80 && summary.avgHumidity <= 95 ? "Ideal Range" : "Outside Range",
      badgeClass: summary.avgHumidity >= 80 && summary.avgHumidity <= 95
        ? "text-emerald-400 bg-emerald-400/10"
        : "text-amber-400 bg-amber-400/10",
      sub: "Target: 80–95% RH",
    },
    {
      title: "Warnings",
      value: String(summary.warningCount),
      icon: AlertTriangle,
      gradient: "from-amber-500/5",
      iconClass: "text-amber-400",
      badge: `${summary.criticalCount} Critical`,
      badgeClass: summary.criticalCount > 0
        ? "text-rose-400 bg-rose-400/10"
        : "text-emerald-400 bg-emerald-400/10",
      sub: "Last 7 days",
    },
    {
      title: "Total Readings",
      value: summary.totalReadings.toLocaleString(),
      icon: Activity,
      gradient: "from-violet-500/5",
      iconClass: "text-violet-400",
      badge: "4 Sensors",
      badgeClass: "text-violet-400 bg-violet-400/10",
      sub: "DHT22 — 2hr intervals",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Monitoring"
        title="Sensor Readings"
        subtitle="Real-time environmental data from DHT22 sensors connected to the ESP32 microcontroller."
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Temperature & Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              24-Hour Temperature & Humidity
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Average sensor readings across all zones — last 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="srFillTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEMP_COLOR} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={TEMP_COLOR} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="srFillHumidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={HUMIDITY_COLOR} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={HUMIDITY_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="temperature" stroke={TEMP_COLOR} strokeWidth={2} fill="url(#srFillTemp)" />
                  <Area type="monotone" dataKey="humidity" stroke={HUMIDITY_COLOR} strokeWidth={2} fill="url(#srFillHumidity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: TEMP_COLOR }} />
                Temperature (°C)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: HUMIDITY_COLOR }} />
                Humidity (% RH)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* CO2 Levels Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              CO₂ Concentration
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Average CO₂ levels measured every 2 hours — parts per million.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} className="fill-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                          <p>
                            <span className="font-semibold" style={{ color: CO2_COLOR }}>{payload[0]?.value} ppm</span>{" "}
                            <span className="text-muted-foreground">CO₂</span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="co2" fill={CO2_COLOR} radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
              <span className="inline-flex items-center gap-2">
                <Wind className="size-3" style={{ color: CO2_COLOR }} />
                CO₂ (ppm) — optimal range: 400–800 ppm
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readings Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Recent Readings
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Individual sensor readings from all DHT22 units — showing latest 50 entries.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={zoneFilter} onValueChange={(v) => { setZoneFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="Zone A">Zone A</SelectItem>
                  <SelectItem value="Zone B">Zone B</SelectItem>
                  <SelectItem value="Zone C">Zone C</SelectItem>
                  <SelectItem value="Zone D">Zone D</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
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
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Sensor</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Zone</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Temp (°C)</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Humidity (%)</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Soil (%)</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">CO₂ (ppm)</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">Light (lux)</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReadings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No sensor readings found matching the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReadings.map((r) => {
                    const st = statusConfig[r.status];
                    return (
                      <TableRow key={r.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {new Date(r.timestamp).toLocaleString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{r.sensorName}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {r.zone}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">{r.temperature}</TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">{r.humidity}</TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">{r.soilMoisture}</TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">{r.co2Level}</TableCell>
                        <TableCell className="text-right text-xs font-mono font-semibold">{r.lightIntensity}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider border", st.class)}>
                            {st.label}
                          </Badge>
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
              totalItems={filteredReadings.length}
              itemLabel="readings"
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
