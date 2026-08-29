"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Search,
  SlidersHorizontal,
  Download,
  Info,
  Sliders,
  History,
  X,
  Eye,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

interface SystemLogEntry {
  id: string;
  timestamp: string;
  source: string;
  category: "automation" | "schedule" | "manual" | "alert" | "system";
  severity: "info" | "warning" | "critical" | "success";
  event: string;
  details: string;
  zone: string;
  raw: any;
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SystemLogsPage() {
  const queryClient = useQueryClient();

  // Filters & State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<SystemLogEntry | null>(null);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    time: true,
    category: true,
    severity: true,
    source: true,
    event: true,
    zone: true,
    details: true,
  });

  // 1. Fetch system logs & actuator logs from Supabase
  const { data: rawLogs = [], isLoading } = useQuery({
    queryKey: ["system-audit-logs"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // Fetch from system_logs
      const { data: sysLogs } = await (supabase as any)
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Fetch from actuator_logs
      const { data: actLogs } = await supabase
        .from("actuator_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      const combined: SystemLogEntry[] = [];

      if (sysLogs && Array.isArray(sysLogs)) {
        sysLogs.forEach((s: any) => {
          combined.push({
            id: s.id,
            timestamp: s.created_at,
            source: s.source || "SYSTEM",
            category: s.category || "system",
            severity: s.severity || "info",
            event: `${s.action} — ${s.source}`,
            details: s.message || s.details || "System event",
            zone: s.zone || "Greenhouse",
            raw: s,
          });
        });
      }

      if (actLogs && Array.isArray(actLogs)) {
        actLogs.forEach((l) => {
          // Avoid duplicate if already logged into system_logs with same ID
          if (!combined.some((c) => c.id === l.id)) {
            const isAuto = l.trigger === "auto";
            const isSchedule = l.trigger === "schedule";
            const isThreshold = l.reason?.toLowerCase().includes("threshold") || l.action === "error";

            let category: SystemLogEntry["category"] = "manual";
            let severity: SystemLogEntry["severity"] = "info";

            if (isThreshold || l.action === "error") {
              category = "alert";
              severity = l.action === "error" ? "critical" : "warning";
            } else if (isAuto) {
              category = "automation";
              severity = "info";
            } else if (isSchedule) {
              category = "schedule";
              severity = "info";
            } else if (l.action === "activated") {
              severity = "success";
            }

            combined.push({
              id: l.id,
              timestamp: l.created_at,
              source: l.actuator_name,
              category,
              severity,
              event: `${l.action.toUpperCase()} — ${l.trigger.toUpperCase()}`,
              details: l.reason || `${l.action} in ${l.zone}`,
              zone: l.zone || "Fruiting Bay",
              raw: l,
            });
          }
        });
      }

      // Sort by newest first
      return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    refetchInterval: 4000,
  });

  // 2. Real-time Supabase Subscription
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channel = supabase
      .channel(`system-logs-sync-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "actuator_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["system-audit-logs"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["system-audit-logs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const allEntries: SystemLogEntry[] = rawLogs;

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = allEntries.length;
    const automations = allEntries.filter((e) => e.category === "automation").length;
    const schedules = allEntries.filter((e) => e.category === "schedule").length;
    const alerts = allEntries.filter((e) => e.category === "alert").length;
    return { total, automations, schedules, alerts };
  }, [allEntries]);

  // Filtered & Paginated Entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          e.source.toLowerCase().includes(q) ||
          e.event.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.zone.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (categoryFilter !== "all" && e.category !== categoryFilter) {
        return false;
      }

      // Severity
      if (severityFilter !== "all" && e.severity !== severityFilter) {
        return false;
      }

      return true;
    });
  }, [allEntries, search, categoryFilter, severityFilter]);

  const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, page, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["ID", "Timestamp", "Source", "Category", "Severity", "Event", "Zone", "Details"];
    const rows = filteredEntries.map((e) => [
      e.id,
      new Date(e.timestamp).toISOString(),
      `"${e.source}"`,
      e.category,
      e.severity,
      `"${e.event}"`,
      `"${e.zone}"`,
      `"${e.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smartgrow_system_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("System logs exported to CSV");
  };

  const getSeverityBadge = (severity: SystemLogEntry["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">CRITICAL</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">WARNING</Badge>;
      case "success":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">SUCCESS</Badge>;
      default:
        return <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px]">INFO</Badge>;
    }
  };

  const getCategoryIcon = (category: SystemLogEntry["category"]) => {
    switch (category) {
      case "alert":
        return <AlertTriangle className="size-3.5 text-amber-400" />;
      case "automation":
        return <Cpu className="size-3.5 text-primary" />;
      case "schedule":
        return <Clock className="size-3.5 text-sky-400" />;
      case "system":
        return <Sliders className="size-3.5 text-purple-400" />;
      default:
        return <Radio className="size-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Monitoring & Auditing"
        title="System Logs & Notifications"
        subtitle="Complete chronological record of all environmental triggers, automated actions, schedules, and alerts."
        actions={
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Events Logged</CardTitle>
            <History className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{metrics.total}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Telemetry & audit entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Automations Triggered</CardTitle>
            <Cpu className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">{metrics.automations}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sensor rule activations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Scheduled Timers</CardTitle>
            <Clock className="size-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-sky-400">{metrics.schedules}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Timed actuator runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Threshold Warnings</CardTitle>
            <AlertTriangle className="size-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-400">{metrics.alerts}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Out-of-range climate alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Audit Trail & Event Records</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Showing {filteredEntries.length} event records recorded in database.
              </CardDescription>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs & events..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 h-9 text-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[130px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Auth & Logins</SelectItem>
                  <SelectItem value="crud">Data CRUD</SelectItem>
                  <SelectItem value="automation">Automations</SelectItem>
                  <SelectItem value="schedule">Schedules</SelectItem>
                  <SelectItem value="alert">Alerts</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>

              {/* Severity Filter */}
              <Select
                value={severityFilter}
                onValueChange={(val) => {
                  setSeverityFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[120px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>

              {/* Column Visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                    <SlidersHorizontal className="size-3.5" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.time}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, time: !!c }))}
                  >
                    Timestamp
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.category}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, category: !!c }))}
                  >
                    Category
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.severity}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, severity: !!c }))}
                  >
                    Severity
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.source}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, source: !!c }))}
                  >
                    Source
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.event}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, event: !!c }))}
                  >
                    Action
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.zone}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, zone: !!c }))}
                  >
                    Zone
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.details}
                    onCheckedChange={(c) => setVisibleColumns((v) => ({ ...v, details: !!c }))}
                  >
                    Details
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  {visibleColumns.time && <TableHead className="text-xs w-[140px]">Time</TableHead>}
                  {visibleColumns.category && <TableHead className="text-xs w-[120px]">Category</TableHead>}
                  {visibleColumns.severity && <TableHead className="text-xs w-[100px]">Severity</TableHead>}
                  {visibleColumns.source && <TableHead className="text-xs w-[160px]">Source</TableHead>}
                  {visibleColumns.event && <TableHead className="text-xs w-[160px]">Action</TableHead>}
                  {visibleColumns.zone && <TableHead className="text-xs w-[120px]">Zone</TableHead>}
                  {visibleColumns.details && <TableHead className="text-xs">Reason / Description</TableHead>}
                  <TableHead className="text-xs text-right w-[80px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && paginatedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                      <History className="size-6 mx-auto mb-2 animate-pulse text-muted-foreground/40" />
                      Loading system logs from database...
                    </TableCell>
                  </TableRow>
                ) : paginatedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-xs text-muted-foreground">
                      <Bell className="size-6 mx-auto mb-2 text-muted-foreground/30" />
                      No system events found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEntries.map((e) => (
                    <TableRow
                      key={e.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setSelectedLog(e)}
                    >
                      {visibleColumns.time && (
                        <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          <div>{timeAgo(e.timestamp)}</div>
                          <div className="text-[10px] text-muted-foreground/50">
                            {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </div>
                        </TableCell>
                      )}

                      {visibleColumns.category && (
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs font-semibold capitalize text-foreground">
                            {getCategoryIcon(e.category)}
                            {e.category}
                          </div>
                        </TableCell>
                      )}

                      {visibleColumns.severity && (
                        <TableCell>{getSeverityBadge(e.severity)}</TableCell>
                      )}

                      {visibleColumns.source && (
                        <TableCell className="text-xs font-semibold text-foreground">
                          {e.source}
                        </TableCell>
                      )}

                      {visibleColumns.event && (
                        <TableCell className="text-xs font-medium text-muted-foreground">
                          {e.event}
                        </TableCell>
                      )}

                      {visibleColumns.zone && (
                        <TableCell className="text-xs text-muted-foreground">
                          {e.zone}
                        </TableCell>
                      )}

                      {visibleColumns.details && (
                        <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                          {e.details}
                        </TableCell>
                      )}

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedLog(e);
                          }}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <TablePagination
            page={page}
            pageSize={pageSize}
            totalItems={filteredEntries.length}
            totalPages={totalPages}
            itemLabel="events"
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Centered Modal: Detailed Event Details */}
      <Dialog open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              {selectedLog && getCategoryIcon(selectedLog.category)}
              <DialogTitle className="text-base font-bold">Event Details</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Activity log and system status record for ID: <span className="font-mono">{selectedLog?.id}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="py-3 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recorded Timestamp</span>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {new Date(selectedLog.timestamp).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {timeAgo(selectedLog.timestamp)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Severity Level</span>
                  <div>{getSeverityBadge(selectedLog.severity)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</span>
                  <div className="flex items-center gap-1.5 font-semibold capitalize text-foreground">
                    {getCategoryIcon(selectedLog.category)}
                    {selectedLog.category}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Component</span>
                  <p className="font-semibold text-foreground">{selectedLog.source}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location / Zone</span>
                  <p className="font-semibold text-foreground">{selectedLog.zone}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action & Trigger</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                    {selectedLog.event}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event Description / Reason</span>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-foreground leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
