"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  GROWTH_BATCHES,
  DAILY_GROWTH_LOGS,
  STAGE_COLORS,
  getGrowthSummary,
  getStageDistribution,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { cn } from "@/lib/utils";
import {
  Sprout,
  Heart,
  Scale,
  Layers,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
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
import { useState, useMemo } from "react";

const summary = getGrowthSummary();
const stageDistribution = getStageDistribution();

export default function GrowthTrackingPage() {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered list of batches
  const filteredBatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GROWTH_BATCHES.filter((b) => {
      const matchesSearch =
        b.batchName.toLowerCase().includes(q) ||
        b.variety.toLowerCase().includes(q) ||
        b.substrate.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      const matchesStage = stageFilter === "all" || b.currentStage === stageFilter;
      const matchesZone = zoneFilter === "all" || b.zone === zoneFilter;
      return matchesSearch && matchesStage && matchesZone;
    });
  }, [query, stageFilter, zoneFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedBatches = useMemo(() => {
    return filteredBatches.slice((safePage - 1) * pageSize, safePage * pageSize);
  }, [filteredBatches, safePage, pageSize]);

  // Recharts custom tooltips
  const renderPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
        <p className="font-semibold text-foreground">
          {data.name}: {data.value} Batches
        </p>
      </div>
    );
  };

  const renderLineTooltip = ({ active, payload, label }: any) => {
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
        {payload.map((item: any) => (
          <p key={item.name} className="flex gap-2 justify-between">
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-semibold" style={{ color: item.color }}>
              {item.value} cm
            </span>
          </p>
        ))}
      </div>
    );
  };

  const metrics = [
    {
      title: "Active Batches",
      value: String(summary.activeBatches),
      icon: Sprout,
      gradient: "from-emerald-500/5",
      iconClass: "text-emerald-400",
      badge: `${summary.fruitingBatches} Fruiting`,
      badgeClass: "text-emerald-400 bg-emerald-400/10",
      sub: "In incubation/fruiting",
    },
    {
      title: "Avg Health Score",
      value: `${summary.avgHealth}%`,
      icon: Heart,
      gradient: "from-rose-500/5",
      iconClass: "text-rose-400",
      badge: summary.avgHealth >= 85 ? "Healthy" : "Needs Review",
      badgeClass:
        summary.avgHealth >= 85
          ? "text-emerald-400 bg-emerald-400/10"
          : "text-amber-400 bg-amber-400/10",
      sub: "Across all rooms",
    },
    {
      title: "Total Yield",
      value: `${(summary.totalYield / 1000).toFixed(1)} kg`,
      icon: Scale,
      gradient: "from-sky-500/5",
      iconClass: "text-sky-400",
      badge: `${summary.completedBatches} Completed`,
      badgeClass: "text-sky-400 bg-sky-400/10",
      sub: "Total harvested weight",
    },
    {
      title: "Fruiting Rooms",
      value: `${summary.fruitingBatches} Batches`,
      icon: Layers,
      gradient: "from-violet-500/5",
      iconClass: "text-violet-400",
      badge: "High Misting",
      badgeClass: "text-violet-400 bg-violet-400/10",
      sub: "Zone A & Zone B active",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Cultivation"
        title="Growth Tracking"
        subtitle="Track oyster mushroom bag batches, colonisation rates, growth dimensions, and harvest yields."
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
        {/* Growth Curve Line Chart (Representative Batch BATCH-004) */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Daily Growth Trend (Batch #4)
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Oyster mushroom height and cap diameter changes recorded daily over the last 28 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={DAILY_GROWTH_LOGS}
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
                  <Tooltip content={renderLineTooltip} />
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
          </CardContent>
        </Card>

        {/* Growth Stage Distribution Pie Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Lifecycle Distribution
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Total active and completed cultivation batches categorized by growth phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <Tooltip content={renderPieTooltip} />
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
          </CardContent>
        </Card>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                Cultivation Batches
              </CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Detailed overview of oyster mushroom bags, incubation progress, and yield history.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                  className="rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
                />
              </div>
              <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-medium bg-card border-border">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="inoculation">Inoculation</SelectItem>
                  <SelectItem value="incubation">Incubation</SelectItem>
                  <SelectItem value="primordia">Primordia</SelectItem>
                  <SelectItem value="fruiting">Fruiting</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">
                    Batch ID
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                    Batch Name / Variety
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                    Substrate
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">
                    Zone
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                    Current Stage
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-center">
                    Timeline Progress
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                    Health
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-right">
                    Yield (Harvested)
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest pr-6">
                    Est. Harvest
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-muted-foreground text-xs"
                    >
                      No cultivation batches found matching the filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBatches.map((batch) => {
                    const st = STAGE_COLORS[batch.currentStage];
                    return (
                      <TableRow
                        key={batch.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="text-xs font-mono font-semibold text-muted-foreground pl-6">
                          {batch.id}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-foreground">
                              {batch.batchName}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {batch.variety}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {batch.substrate}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                            {batch.zone}
                          </span>
                        </TableCell>
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
                        <TableCell className="text-xs text-muted-foreground/80 pr-6">
                          {new Date(batch.estimatedHarvestDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
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
            totalItems={filteredBatches.length}
            itemLabel="batches"
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
