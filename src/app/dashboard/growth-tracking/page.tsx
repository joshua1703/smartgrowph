"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  GROWTH_BATCHES as FALLBACK_BATCHES,
  DAILY_GROWTH_LOGS as FALLBACK_LOGS,
  STAGE_COLORS,
  GrowthBatch,
  GrowthStage,
} from "@/data/growth-tracking";
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
import { cn } from "@/lib/utils";
import {
  Sprout,
  Heart,
  Scale,
  Layers,
  Search,
  SlidersHorizontal,
  MapPin,
  Leaf,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { toast } from "sonner";

type OptionalBatchColumn =
  | "variety"
  | "substrate"
  | "zone"
  | "stage"
  | "progress"
  | "health"
  | "yield"
  | "estHarvest";

export default function GrowthTrackingPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBatch, setSelectedBatch] = useState<GrowthBatch | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Column Visibility Toggle State (Batch ID is unhideable)
  const [visibleColumns, setVisibleColumns] = useState<Record<OptionalBatchColumn, boolean>>({
    variety: true,
    substrate: true,
    zone: true,
    stage: true,
    progress: true,
    health: true,
    yield: true,
    estHarvest: true,
  });

  const toggleColumn = (key: OptionalBatchColumn) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleColumnCount = useMemo(() => {
    return 1 + Object.values(visibleColumns).filter(Boolean).length;
  }, [visibleColumns]);

  // 1. TanStack Query: Fetch Batches from Supabase PostgreSQL
  const { data: batches = [] } = useQuery<GrowthBatch[]>({
    queryKey: ["growth-batches"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("growth_batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((b) => ({
        id: b.id,
        batchName: b.batch_name,
        substrate: b.substrate,
        variety: b.variety,
        zone: b.zone,
        startDate: b.start_date ? b.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        currentStage: b.current_stage as GrowthStage,
        daysSinceStart: b.days_since_start ?? 0,
        estimatedHarvestDate: b.estimated_harvest_date ? b.estimated_harvest_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        progress: b.progress ?? 0,
        yield: b.yield ?? null,
        expectedYield: b.expected_yield ?? 1000,
        healthScore: b.health_score ?? 90,
        notes: b.notes || "",
      }));
    },
    refetchInterval: 5000,
  });

  // 2. TanStack Query: Fetch Daily Growth Logs from Supabase PostgreSQL
  const { data: dailyGrowthLogs = [] } = useQuery<{ date: string; height: number; capDiameter: number }[]>({
    queryKey: ["daily-growth-logs"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("daily_growth_logs")
        .select("date, height, cap_diameter")
        .order("date", { ascending: true })
        .limit(30);

      if (error || !data) {
        return [];
      }

      return data.map((l) => ({
        date: l.date ? l.date.slice(0, 10) : "",
        height: Number(l.height),
        capDiameter: Number(l.cap_diameter),
      }));
    },
    refetchInterval: 10000,
  });

  // 3. Supabase Realtime Subscription: Instant live updates on batch modifications
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `growth-batches-sync-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "growth_batches" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["growth-batches"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Dynamic Metrics derived from live database batches
  const metrics = useMemo(() => {
    const activeBatches = batches.filter((b) => b.currentStage !== "completed").length;
    const fruitingBatches = batches.filter((b) => b.currentStage === "fruiting").length;
    const completedBatches = batches.filter((b) => b.currentStage === "completed").length;
    const totalYield = batches.reduce((acc, b) => acc + (b.yield || 0), 0);
    const avgHealth = Math.round(
      batches.reduce((acc, b) => acc + b.healthScore, 0) / (batches.length || 1)
    );

    return [
      {
        title: "Active Batches",
        value: String(activeBatches),
        icon: Sprout,
        gradient: "from-emerald-500/5",
        iconClass: "text-emerald-400",
        badge: `${fruitingBatches} Fruiting`,
        badgeClass: "text-emerald-400 bg-emerald-400/10",
        sub: "In incubation/fruiting",
      },
      {
        title: "Avg Health Score",
        value: `${avgHealth}%`,
        icon: Heart,
        gradient: "from-rose-500/5",
        iconClass: "text-rose-400",
        badge: avgHealth >= 85 ? "Healthy" : "Needs Review",
        badgeClass:
          avgHealth >= 85
            ? "text-emerald-400 bg-emerald-400/10"
            : "text-amber-400 bg-amber-400/10",
        sub: "Across all rooms",
      },
      {
        title: "Total Yield",
        value: `${(totalYield / 1000).toFixed(1)} kg`,
        icon: Scale,
        gradient: "from-sky-500/5",
        iconClass: "text-sky-400",
        badge: `${completedBatches} Completed`,
        badgeClass: "text-sky-400 bg-sky-400/10",
        sub: "Total harvested weight",
      },
      {
        title: "Fruiting Rooms",
        value: `${fruitingBatches} Batches`,
        icon: Layers,
        gradient: "from-violet-500/5",
        iconClass: "text-violet-400",
        badge: "High Misting",
        badgeClass: "text-violet-400 bg-violet-400/10",
        sub: "Zone A & Zone B active",
      },
    ];
  }, [batches]);

  // Lifecycle Distribution computed from database records
  const stageDistribution = useMemo(() => {
    const counts: Record<GrowthStage, number> = {
      inoculation: 0,
      incubation: 0,
      primordia: 0,
      fruiting: 0,
      harvest: 0,
      completed: 0,
    };
    batches.forEach((b) => {
      if (counts[b.currentStage] !== undefined) {
        counts[b.currentStage]++;
      }
    });

    return [
      { name: "Inoculation", value: counts.inoculation, fill: "#38bdf8" },
      { name: "Incubation", value: counts.incubation, fill: "#fbbf24" },
      { name: "Primordia", value: counts.primordia, fill: "#a855f7" },
      { name: "Fruiting", value: counts.fruiting, fill: "#10b981" },
      { name: "Harvest", value: counts.harvest, fill: "#f97316" },
      { name: "Completed", value: counts.completed, fill: "#06b6d4" },
    ].filter((s) => s.value > 0);
  }, [batches]);

  // Live stage update in database
  const handleUpdateStage = async (newStage: GrowthStage) => {
    if (!selectedBatch) return;
    setIsUpdatingStage(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
        await supabase
          .from("growth_batches")
          .update({ current_stage: newStage, updated_at: new Date().toISOString() })
          .eq("id", selectedBatch.id);
      }

      setSelectedBatch((prev) => (prev ? { ...prev, currentStage: newStage } : null));
      queryClient.invalidateQueries({ queryKey: ["growth-batches"] });
      toast.success(`Batch ${selectedBatch.id} stage updated to ${newStage.toUpperCase()}`);
    } catch {
      toast.error("Failed to update growth stage in database.");
    } finally {
      setIsUpdatingStage(false);
    }
  };

  // Filtered list of batches
  const filteredBatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter((b) => {
      return (
        b.batchName.toLowerCase().includes(q) ||
        b.variety.toLowerCase().includes(q) ||
        b.substrate.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.zone.toLowerCase().includes(q) ||
        b.currentStage.toLowerCase().includes(q)
      );
    });
  }, [batches, query]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedBatches = useMemo(() => {
    return filteredBatches.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredBatches, safePage, pageSize]);

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Cultivation"
        title="Growth Tracking"
        subtitle="Live tracking of oyster mushroom bag batches, incubation rates, growth metrics, and harvest yields directly from the database."
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

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Growth Curve Line Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Daily Growth Trend (Live Metrics)
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Oyster mushroom height and cap diameter recorded daily in database tables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dailyGrowthLogs.length === 0 ? (
              <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
                <Sprout className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">No daily growth records in database yet</p>
                <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                  Growth curves and cap diameter tracking will automatically plot as daily log entries are saved.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyGrowthLogs}
                      margin={{ top: 8, right: 12, left: -8, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9 }}
                        className="fill-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) =>
                          new Date(val).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
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
                          const formattedDate = new Date(label).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                          return (
                            <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg space-y-1">
                              <p className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                                {formattedDate}
                              </p>
                              {payload.map((item) => (
                                <p key={item.name} className="flex gap-2 justify-between">
                                  <span className="text-muted-foreground">{item.name}:</span>
                                  <span className="font-semibold" style={{ color: item.color }}>
                                    {String(item.value)} cm
                                  </span>
                                </p>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="height"
                        name="Oyster Mushroom Height"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="capDiameter"
                        name="Cap Diameter"
                        stroke="#a855f7"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Oyster Mushroom Height (cm)
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-purple-500" />
                    Cap Diameter (cm)
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Growth Stage Distribution Pie Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Lifecycle Distribution
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Active and completed batches categorized by growth phase from live database rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stageDistribution.length === 0 ? (
              <div className="h-[220px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
                <Layers className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
                <p className="text-xs font-semibold text-foreground">No batches registered in database</p>
                <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                  Lifecycle distribution will render once oyster mushroom batches are added to Supabase.
                </p>
              </div>
            ) : (
              <>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {stageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                              <p className="font-semibold text-foreground">
                                {data.name}: {data.value} Batches
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
                  {stageDistribution.map((t) => (
                    <span key={t.name} className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ background: t.fill }}
                      />
                      {t.name} ({t.value})
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Batches Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Cultivation Batches
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Live database records of oyster mushroom batches. Click any row to inspect or update parameters.
              </CardDescription>
            </div>

            {/* Standardized Search & Column Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search batch, variety..."
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
                    checked={visibleColumns.variety}
                    onCheckedChange={() => toggleColumn("variety")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Variety Name
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.substrate}
                    onCheckedChange={() => toggleColumn("substrate")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Substrate
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.zone}
                    onCheckedChange={() => toggleColumn("zone")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Zone
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.stage}
                    onCheckedChange={() => toggleColumn("stage")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Current Stage
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.progress}
                    onCheckedChange={() => toggleColumn("progress")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Timeline Progress
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.health}
                    onCheckedChange={() => toggleColumn("health")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Health Score
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.yield}
                    onCheckedChange={() => toggleColumn("yield")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Harvested Yield
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.estHarvest}
                    onCheckedChange={() => toggleColumn("estHarvest")}
                    className="text-xs font-medium cursor-pointer"
                  >
                    Est. Harvest
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
                  {/* Batch ID Column is Unhideable */}
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">
                    Batch ID
                  </TableHead>
                  {visibleColumns.variety && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Batch Name / Variety
                    </TableHead>
                  )}
                  {visibleColumns.substrate && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Substrate
                    </TableHead>
                  )}
                  {visibleColumns.zone && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                      Zone
                    </TableHead>
                  )}
                  {visibleColumns.stage && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                      Current Stage
                    </TableHead>
                  )}
                  {visibleColumns.progress && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                      Timeline Progress
                    </TableHead>
                  )}
                  {visibleColumns.health && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Health
                    </TableHead>
                  )}
                  {visibleColumns.yield && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                      Yield (Harvested)
                    </TableHead>
                  )}
                  {visibleColumns.estHarvest && (
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest pr-6">
                      Est. Harvest
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No cultivation batches found matching the query.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBatches.map((batch) => {
                    const st = STAGE_COLORS[batch.currentStage] || { bg: "bg-muted", text: "text-muted-foreground" };
                    return (
                      <TableRow
                        key={batch.id}
                        onClick={() => setSelectedBatch(batch)}
                        className={cn(
                          "cursor-pointer transition-all duration-200 group border-b border-border/50",
                          selectedBatch?.id === batch.id
                            ? "bg-primary/10 hover:bg-primary/15 shadow-inner"
                            : "hover:bg-muted/40 active:scale-[0.997]"
                        )}
                      >
                        {/* 1. Batch ID (Unhideable) */}
                        <TableCell className="text-xs font-mono font-bold text-foreground pl-6 py-3">
                          {batch.id}
                        </TableCell>

                        {/* 2. Variety Name */}
                        {visibleColumns.variety && (
                          <TableCell className="py-3">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                {batch.batchName}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {batch.variety}
                              </p>
                            </div>
                          </TableCell>
                        )}

                        {/* 3. Substrate */}
                        {visibleColumns.substrate && (
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {batch.substrate}
                          </TableCell>
                        )}

                        {/* 4. Zone */}
                        {visibleColumns.zone && (
                          <TableCell>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              {batch.zone}
                            </span>
                          </TableCell>
                        )}

                        {/* 5. Stage */}
                        {visibleColumns.stage && (
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider border bg-opacity-10",
                                st.bg,
                                st.text
                              )}
                            >
                              {batch.currentStage}
                            </Badge>
                          </TableCell>
                        )}

                        {/* 6. Progress */}
                        {visibleColumns.progress && (
                          <TableCell>
                            <div className="flex flex-col items-center gap-1 justify-center">
                              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                {batch.progress}% ({batch.daysSinceStart}d)
                              </span>
                              <div className="w-24 bg-muted border border-border/50 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all"
                                  style={{ width: `${batch.progress}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        )}

                        {/* 7. Health */}
                        {visibleColumns.health && (
                          <TableCell className="text-right text-xs">
                            <span
                              className={cn(
                                "font-mono font-bold",
                                batch.healthScore >= 90
                                  ? "text-emerald-400"
                                  : batch.healthScore >= 80
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              )}
                            >
                              {batch.healthScore}%
                            </span>
                          </TableCell>
                        )}

                        {/* 8. Yield */}
                        {visibleColumns.yield && (
                          <TableCell className="text-right text-xs font-mono font-bold">
                            {batch.yield != null ? (
                              <span className="text-emerald-400">
                                {batch.yield.toLocaleString()}g
                              </span>
                            ) : (
                              <span className="text-muted-foreground/45">
                                ~{batch.expectedYield.toLocaleString()}g
                              </span>
                            )}
                          </TableCell>
                        )}

                        {/* 9. Est. Harvest */}
                        {visibleColumns.estHarvest && (
                          <TableCell className="text-xs text-muted-foreground/80 font-mono pr-6">
                            {new Date(batch.estimatedHarvestDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
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
              totalItems={filteredBatches.length}
              itemLabel="batches"
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Right-Side Sheet Drawer: Batch Cultivation Details */}
      <Sheet open={!!selectedBatch} onOpenChange={(open) => !open && setSelectedBatch(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-card border-border p-6 overflow-y-auto z-50 flex flex-col gap-6"
        >
          <SheetHeader className="p-0 text-left space-y-1">
            <SheetTitle className="text-lg font-bold text-foreground">
              Cultivation Batch Profile
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Detailed biological parameters, growth phase progress, and substrate metadata from database.
            </SheetDescription>
          </SheetHeader>

          {selectedBatch && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300 fill-mode-both">
              {/* Batch Banner Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-muted/30 border border-border/70 shadow-xs">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Sprout className="size-6" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{selectedBatch.batchName}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider border",
                        STAGE_COLORS[selectedBatch.currentStage]?.bg,
                        STAGE_COLORS[selectedBatch.currentStage]?.text
                      )}
                    >
                      {selectedBatch.currentStage}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{selectedBatch.variety}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono truncate">ID: {selectedBatch.id}</p>
                </div>
              </div>

              {/* 2x2 Quick Metadata Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <MapPin className="size-3 text-primary" /> Location Zone
                  </span>
                  <p className="font-semibold text-foreground">{selectedBatch.zone}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Heart className="size-3 text-rose-400" /> Health Rating
                  </span>
                  <p className="font-semibold text-foreground font-mono">{selectedBatch.healthScore}% Optimal</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <TrendingUp className="size-3 text-sky-400" /> Timeline Progress
                  </span>
                  <p className="font-semibold text-foreground font-mono">
                    {selectedBatch.progress}% ({selectedBatch.daysSinceStart} days)
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1 transition-all hover:bg-muted/30">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <Scale className="size-3 text-emerald-400" /> Harvested Yield
                  </span>
                  <p className="font-semibold text-foreground font-mono">
                    {selectedBatch.yield != null ? `${selectedBatch.yield}g` : `~${selectedBatch.expectedYield}g est.`}
                  </p>
                </div>
              </div>

              {/* Substrate & Colonization Details */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/60 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Leaf className="size-3.5 text-primary" /> Substrate Composition
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedBatch.substrate}
                </p>
                <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">Inoculation Date:</span>{" "}
                    <p className="font-mono mt-0.5">{selectedBatch.startDate}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Est. Harvest:</span>{" "}
                    <p className="font-mono mt-0.5">{selectedBatch.estimatedHarvestDate}</p>
                  </div>
                </div>
              </div>

              {/* Action: Update Growth Stage in Supabase */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold">Advance Growth Phase (Live Database)</Label>
                <Select
                  value={selectedBatch.currentStage}
                  disabled={isUpdatingStage}
                  onValueChange={(v) => handleUpdateStage(v as GrowthStage)}
                >
                  <SelectTrigger className="h-9 text-xs bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover p-1 shadow-xl">
                    <SelectItem value="inoculation" className="text-xs py-2 rounded-lg cursor-pointer">Inoculation</SelectItem>
                    <SelectItem value="incubation" className="text-xs py-2 rounded-lg cursor-pointer">Incubation</SelectItem>
                    <SelectItem value="primordia" className="text-xs py-2 rounded-lg cursor-pointer">Primordia</SelectItem>
                    <SelectItem value="fruiting" className="text-xs py-2 rounded-lg cursor-pointer">Fruiting</SelectItem>
                    <SelectItem value="harvest" className="text-xs py-2 rounded-lg cursor-pointer">Harvest</SelectItem>
                    <SelectItem value="completed" className="text-xs py-2 rounded-lg cursor-pointer">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {isUpdatingStage && (
                  <p className="text-[11px] text-primary flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin" /> Saving changes to database...
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBatch(null)}
                  className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer mt-2"
                >
                  Close Profile
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
