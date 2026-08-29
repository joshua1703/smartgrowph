"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  SENSOR_READINGS as FALLBACK_READINGS,
  getLast24HoursAvg as getFallback24HoursAvg,
  SensorReading,
} from "@/data/sensor-readings";
import type { SensorStatus } from "@/lib/supabase/types";
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
  Thermometer,
  Droplets,
  AlertTriangle,
  Wind,
  Sun,
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Cpu,
  Radio,
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

const TEMP_COLOR = "#ef4444";
const HUMIDITY_COLOR = "#38bdf8";
const CO2_COLOR = "#a855f7";

const statusConfig = {
  normal: { label: "Normal", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
  warning: { label: "Warning", class: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400" },
  critical: { label: "Critical", class: "text-rose-400 bg-rose-400/10 border-rose-400/20", dot: "bg-rose-400" },
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

type OptionalSensorColumn =
  | "sensor"
  | "zone"
  | "temp"
  | "humidity"
  | "soil"
  | "co2"
  | "light"
  | "status";

export default function SensorReadingsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedReading, setSelectedReading] = useState<SensorReading | null>(null);

  // Column Visibility Toggle State (Timestamp is unhideable)
  const [visibleColumns, setVisibleColumns] = useState<Record<OptionalSensorColumn, boolean>>({
    sensor: true,
    zone: true,
    temp: true,
    humidity: true,
    soil: true,
    co2: true,
    light: true,
    status: true,
  });

  const toggleColumn = (key: OptionalSensorColumn) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleColumnCount = useMemo(() => {
    return 1 + Object.values(visibleColumns).filter(Boolean).length;
  }, [visibleColumns]);

  // 1. TanStack Query: Fetch Sensor Readings from Supabase PostgreSQL
  const { data: readings = [] } = useQuery<SensorReading[]>({
    queryKey: ["sensor-readings"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error || !data) {
        return [];
      }

      return data.map((r) => ({
        id: r.id,
        sensorId: r.sensor_id,
        timestamp: r.created_at,
        sensorName: r.sensor_name,
        zone: r.zone,
        temperature: Number(r.temperature),
        humidity: Number(r.humidity),
        soilMoisture: Number(r.soil_moisture),
        co2Level: Number(r.co2_level),
        lightIntensity: Number(r.light_intensity),
        status: r.status as SensorStatus,
      }));
    },
    refetchInterval: 4000,
  });

  // 2. Supabase Realtime Subscription: Instant live updates on sensor telemetry stream
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `sensor-readings-sync-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sensor-readings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Compute live 24-hour average trends from database readings
  const hourlyData = useMemo(() => {
    if (!readings || readings.length === 0) return [];

    const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    const grouped: Record<string, { temps: number[]; hums: number[]; co2s: number[] }> = {};
    hours.forEach((h) => {
      grouped[h] = { temps: [], hums: [], co2s: [] };
    });

    readings.forEach((r) => {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        const hour = d.getHours();
        const slot = `${String(Math.floor(hour / 2) * 2).padStart(2, "0")}:00`;
        if (grouped[slot]) {
          grouped[slot].temps.push(r.temperature);
          grouped[slot].hums.push(r.humidity);
          grouped[slot].co2s.push(r.co2Level);
        }
      }
    });

    // Only return data points for hours with real database measurements
    const result = hours
      .map((hour) => {
        const g = grouped[hour];
        if (g.temps.length === 0) return null;
        const avgTemp = Number((g.temps.reduce((a, b) => a + b, 0) / g.temps.length).toFixed(1));
        const avgHum = Math.round(g.hums.reduce((a, b) => a + b, 0) / g.hums.length);
        const avgCo2 = Math.round(g.co2s.reduce((a, b) => a + b, 0) / g.co2s.length);
        return { hour, temperature: avgTemp, humidity: avgHum, co2: avgCo2 };
      })
      .filter(Boolean) as { hour: string; temperature: number; humidity: number; co2: number }[];

    return result;
  }, [readings]);

  // Dynamic Metrics calculated directly from database rows
  const metrics = useMemo(() => {
    const total = readings.length;
    const hasData = total > 0;
    const avgTemp = hasData
      ? (readings.reduce((acc, r) => acc + r.temperature, 0) / total).toFixed(1)
      : null;
    const avgHumidity = hasData
      ? Math.round(readings.reduce((acc, r) => acc + r.humidity, 0) / total)
      : null;
    const warningCount = readings.filter((r) => r.status === "warning").length;
    const criticalCount = readings.filter((r) => r.status === "critical").length;

    return [
      {
        title: "Avg Temperature",
        value: avgTemp !== null ? `${avgTemp}°C` : "—",
        icon: Thermometer,
        gradient: "from-rose-500/5",
        iconClass: "text-rose-400",
        badge: avgTemp !== null && Number(avgTemp) >= 24 && Number(avgTemp) <= 28 ? "Optimal" : hasData ? "Check Range" : "No Readings",
        badgeClass: avgTemp !== null && Number(avgTemp) >= 24 && Number(avgTemp) <= 28
          ? "text-emerald-400 bg-emerald-400/10"
          : hasData
          ? "text-amber-400 bg-amber-400/10"
          : "text-muted-foreground bg-muted/40",
        sub: hasData ? "Latest readings average" : "Awaiting sensor feed",
      },
      {
        title: "Avg Humidity",
        value: avgHumidity !== null ? `${avgHumidity}% RH` : "—",
        icon: Droplets,
        gradient: "from-sky-500/5",
        iconClass: "text-sky-400",
        badge: avgHumidity !== null && avgHumidity >= 80 && avgHumidity <= 95 ? "Ideal Range" : hasData ? "Outside Range" : "No Readings",
        badgeClass: avgHumidity !== null && avgHumidity >= 80 && avgHumidity <= 95
          ? "text-emerald-400 bg-emerald-400/10"
          : hasData
          ? "text-amber-400 bg-amber-400/10"
          : "text-muted-foreground bg-muted/40",
        sub: "Target: 80–95% RH",
      },
      {
        title: "Warnings",
        value: String(warningCount),
        icon: AlertTriangle,
        gradient: "from-amber-500/5",
        iconClass: "text-amber-400",
        badge: criticalCount > 0 ? `${criticalCount} Critical` : "All Clear",
        badgeClass: criticalCount > 0
          ? "text-rose-400 bg-rose-400/10"
          : "text-emerald-400 bg-emerald-400/10",
        sub: "Database status entries",
      },
      {
        title: "Total Readings",
        value: readings.length.toLocaleString(),
        icon: Radio,
        gradient: "from-violet-500/5",
        iconClass: "text-violet-400",
        badge: "Live Telemetry",
        badgeClass: "text-violet-400 bg-violet-400/10",
        sub: "Database records",
      },
    ];
  }, [readings]);

  const filteredReadings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return readings;
    return readings.filter((r) => {
      return (
        r.sensorName.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [readings, query]);

  const totalPages = Math.max(1, Math.ceil(filteredReadings.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedReadings = useMemo(() => {
    return filteredReadings.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredReadings, safePage, pageSize]);

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Monitoring"
        title="Sensor Readings"
        subtitle="Real-time environmental telemetry from DHT22 sensors and ESP32 nodes connected directly to the database."
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Temperature & Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              24-Hour Temperature & Humidity (Database Records)
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Average sensor readings across all zones calculated from logged database telemetry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyData.length === 0 ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
                <Radio className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">No sensor readings logged in database yet</p>
                <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                  Graphs will automatically plot telemetry in real time once DHT22 probes transmit data to Supabase.
                </p>
              </div>
            ) : (
              <>
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
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const row = payload[0]?.payload;
                          if (!row) return null;
                          return (
                            <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
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
                        }}
                      />
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
              </>
            )}
          </CardContent>
        </Card>

        {/* CO2 Levels Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              CO₂ Concentration (Database Records)
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Average CO₂ parts-per-million levels tracked in database rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hourlyData.length === 0 ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
                <Wind className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">No CO₂ measurements in database</p>
                <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                  Air quality and CO₂ levels will display as telemetry arrives from greenhouse probes.
                </p>
              </div>
            ) : (
              <>
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
                                <span className="font-semibold" style={{ color: CO2_COLOR }}>{String(payload[0]?.value)} ppm</span>{" "}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Readings Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Recent Readings
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Live sensor database telemetry. Click any entry to inspect probe diagnostics.
              </CardDescription>
            </div>

            {/* Standardized Search & Column Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sensor, zone..."
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
                    checked={visibleColumns.sensor}
                    onCheckedChange={() => toggleColumn("sensor")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Sensor Name
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.zone}
                    onCheckedChange={() => toggleColumn("zone")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Zone
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.temp}
                    onCheckedChange={() => toggleColumn("temp")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Temperature
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.humidity}
                    onCheckedChange={() => toggleColumn("humidity")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Humidity
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.soil}
                    onCheckedChange={() => toggleColumn("soil")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Soil Moisture
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.co2}
                    onCheckedChange={() => toggleColumn("co2")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    CO₂ Level
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.light}
                    onCheckedChange={() => toggleColumn("light")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Light (lux)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.status}
                    onCheckedChange={() => toggleColumn("status")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Status
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
                  {visibleColumns.sensor && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Sensor
                    </TableHead>
                  )}
                  {visibleColumns.zone && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Zone
                    </TableHead>
                  )}
                  {visibleColumns.temp && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Temp (°C)
                    </TableHead>
                  )}
                  {visibleColumns.humidity && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Humidity (%)
                    </TableHead>
                  )}
                  {visibleColumns.soil && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Soil (%)
                    </TableHead>
                  )}
                  {visibleColumns.co2 && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      CO₂ (ppm)
                    </TableHead>
                  )}
                  {visibleColumns.light && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Light (lux)
                    </TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center pr-6">
                      Status
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedReadings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No sensor readings found matching the query.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReadings.map((r) => {
                    const st = statusConfig[r.status] || { label: r.status, class: "text-muted-foreground", dot: "bg-muted-foreground" };
                    return (
                      <TableRow
                        key={r.id}
                        onClick={() => setSelectedReading(r)}
                        className={cn(
                          "cursor-pointer transition-all duration-200 group border-b border-border/50",
                          selectedReading?.id === r.id
                            ? "bg-primary/10 hover:bg-primary/15 shadow-inner"
                            : "hover:bg-muted/40 active:scale-[0.997]"
                        )}
                      >
                        {/* 1. Timestamp (Unhideable) */}
                        <TableCell className="text-xs font-mono text-muted-foreground pl-6 py-3">
                          {formatTimestamp(r.timestamp)}
                        </TableCell>

                        {/* 2. Sensor Name */}
                        {visibleColumns.sensor && (
                          <TableCell className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {r.sensorName}
                          </TableCell>
                        )}

                        {/* 3. Zone */}
                        {visibleColumns.zone && (
                          <TableCell>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {r.zone}
                            </span>
                          </TableCell>
                        )}

                        {/* 4. Temp */}
                        {visibleColumns.temp && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {r.temperature}°C
                          </TableCell>
                        )}

                        {/* 5. Humidity */}
                        {visibleColumns.humidity && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {r.humidity}%
                          </TableCell>
                        )}

                        {/* 6. Soil */}
                        {visibleColumns.soil && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {r.soilMoisture}%
                          </TableCell>
                        )}

                        {/* 7. CO2 */}
                        {visibleColumns.co2 && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {r.co2Level}
                          </TableCell>
                        )}

                        {/* 8. Light */}
                        {visibleColumns.light && (
                          <TableCell className="text-right text-xs font-mono font-semibold text-foreground">
                            {r.lightIntensity}
                          </TableCell>
                        )}

                        {/* 9. Status */}
                        {visibleColumns.status && (
                          <TableCell className="text-center pr-6">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                st.class
                              )}
                            >
                              <span className={cn("size-1.5 rounded-full", st.dot)} />
                              {st.label}
                            </span>
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

      {/* Right-Side Sheet Drawer: Sensor Reading Details */}
      <Sheet open={!!selectedReading} onOpenChange={(open) => !open && setSelectedReading(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-card border-border p-6 overflow-y-auto z-50 flex flex-col gap-6"
        >
          <SheetHeader className="p-0 text-left space-y-1">
            <SheetTitle className="text-lg font-bold text-foreground">
              Sensor Telemetry Snapshot
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Microcontroller probe reading data, zone conditions, and threshold status from database.
            </SheetDescription>
          </SheetHeader>

          {selectedReading && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300 fill-mode-both">
              {/* Sensor Banner Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70 shadow-xs">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Radio className="size-6" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{selectedReading.sensorName}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider border",
                        statusConfig[selectedReading.status]?.class
                      )}
                    >
                      {statusConfig[selectedReading.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{selectedReading.zone}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono truncate">ID: {selectedReading.id}</p>
                </div>
              </div>

              {/* 2x2 Telemetry Metric Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Thermometer className="size-3 text-rose-400" /> Temperature
                  </span>
                  <p className="font-semibold text-foreground font-mono text-sm">{selectedReading.temperature}°C</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Droplets className="size-3 text-sky-400" /> Relative Humidity
                  </span>
                  <p className="font-semibold text-foreground font-mono text-sm">{selectedReading.humidity}% RH</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Wind className="size-3 text-purple-400" /> CO₂ Level
                  </span>
                  <p className="font-semibold text-foreground font-mono text-sm">{selectedReading.co2Level} ppm</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Sun className="size-3 text-amber-400" /> Light Intensity
                  </span>
                  <p className="font-semibold text-foreground font-mono text-sm">{selectedReading.lightIntensity} lux</p>
                </div>
              </div>

              {/* Probe Diagnostics Details */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/60 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-primary" /> Probe Diagnostics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">Recorded Time:</span>{" "}
                    <p className="font-mono mt-0.5">{formatTimestamp(selectedReading.timestamp)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Soil Moisture:</span>{" "}
                    <p className="font-mono mt-0.5">{selectedReading.soilMoisture}%</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Hardware Probe:</span>{" "}
                    <p className="font-mono mt-0.5">DHT22 / ESP32</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Signal Quality:</span>{" "}
                    <p className="font-mono mt-0.5 text-emerald-400 font-semibold">99.4% Strong</p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedReading(null)}
                className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Snapshot
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
