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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Plus,
  PlusCircle,
  Sparkles,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useUserRole } from "@/lib/use-user-role";
import { logSystemActivity } from "@/lib/audit-logger";
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
  const { canManageBatches, canControlDevices, isAdmin, isViewer, role } = useUserRole();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedBatch, setSelectedBatch] = useState<GrowthBatch | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Modal dialog states
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isLogMeasurementOpen, setIsLogMeasurementOpen] = useState(false);
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<GrowthBatch | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // New batch form state
  const [batchName, setBatchName] = useState("Batch #01 — Pearl Oyster");
  const [variety, setVariety] = useState("Pearl Oyster (Pleurotus ostreatus)");
  const [substrate, setSubstrate] = useState("Rice Straw + Sawdust Mix");
  const [zone, setZone] = useState("Fruiting Bay - Zone A");
  const [currentStage, setCurrentStage] = useState<GrowthStage>("fruiting");
  const [expectedYield, setExpectedYield] = useState("1200");
  const [notes, setNotes] = useState("Healthy mycelium growth observed.");

  // Edit batch form state
  const [editBatchId, setEditBatchId] = useState("");
  const [editBatchName, setEditBatchName] = useState("");
  const [editVariety, setEditVariety] = useState("");
  const [editSubstrate, setEditSubstrate] = useState("");
  const [editZone, setEditZone] = useState("");
  const [editStage, setEditStage] = useState<GrowthStage>("fruiting");
  const [editProgress, setEditProgress] = useState("80");
  const [editHealthScore, setEditHealthScore] = useState("95");
  const [editYield, setEditYield] = useState("");
  const [editExpectedYield, setEditExpectedYield] = useState("1000");
  const [editNotes, setEditNotes] = useState("");

  // Daily measurement form state
  const [measBatchId, setMeasBatchId] = useState("");
  const [measHeight, setMeasHeight] = useState("4.5");
  const [measCapDiameter, setMeasCapDiameter] = useState("3.2");
  const [measMoisture, setMeasMoisture] = useState("86.0");
  const [measPins, setMeasPins] = useState("8");

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

  const handleAddBatch = async () => {
    if (!canManageBatches) {
      toast.error("Permission Denied", {
        description: `Your role (${role.toUpperCase()}) cannot create cultivation batches. Operators and Admins only.`,
      });
      return;
    }

    if (!batchName.trim()) {
      toast.error("Please enter a batch name.");
      return;
    }

    setIsSubmittingBatch(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from("growth_batches").insert({
        id: batchId,
        batch_name: batchName,
        variety,
        substrate,
        zone,
        current_stage: currentStage,
        days_since_start: currentStage === "inoculation" ? 1 : currentStage === "incubation" ? 7 : currentStage === "primordia" ? 14 : 20,
        progress: currentStage === "inoculation" ? 10 : currentStage === "incubation" ? 40 : currentStage === "primordia" ? 70 : 85,
        expected_yield: parseInt(expectedYield) || 1000,
        health_score: 95,
        notes,
        start_date: new Date().toISOString(),
        estimated_harvest_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) {
        toast.error("Failed to add batch", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["growth-batches"] });

      // Log in system logs
      logSystemActivity({
        source: "BATCH",
        category: "crud",
        severity: "success",
        action: "CREATE_BATCH",
        message: `Registered new cultivation batch '${batchName}'`,
        details: `Variety: ${variety}, Substrate: ${substrate}, Zone: ${zone}`,
      });

      toast.success("Cultivation Batch Registered", {
        description: `${batchName} has been added to greenhouse database.`,
      });
      setIsAddBatchOpen(false);
    } catch {
      toast.error("Failed to register batch.");
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleLogMeasurement = async () => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role (${role.toUpperCase()}) cannot record daily growth telemetry.`,
      });
      return;
    }

    if (!measBatchId) {
      toast.error("Please select a batch.");
      return;
    }

    setIsSubmittingLog(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const { error } = await supabase.from("daily_growth_logs").insert({
        batch_id: measBatchId,
        height: parseFloat(measHeight) || 0,
        cap_diameter: parseFloat(measCapDiameter) || 0,
        moisture_level: parseFloat(measMoisture) || 85.0,
        primordia_density: parseInt(measPins) || 0,
        contamination: false,
        date: new Date().toISOString(),
      });

      if (error) {
        toast.error("Failed to record growth log", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["daily-growth-logs"] });

      // Log in system logs
      logSystemActivity({
        source: "BATCH",
        category: "crud",
        severity: "info",
        action: "LOG_GROWTH",
        message: `Logged growth measurements for batch ${measBatchId}`,
        details: `Height: ${measHeight}cm, Cap: ${measCapDiameter}cm, Moisture: ${measMoisture}%`,
      });

      toast.success("Growth Measurements Recorded", {
        description: `Height: ${measHeight}cm, Cap Diameter: ${measCapDiameter}cm saved.`,
      });
      setIsLogMeasurementOpen(false);
    } catch {
      toast.error("Failed to record measurement.");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const openEditModal = (batch: GrowthBatch) => {
    setEditBatchId(batch.id);
    setEditBatchName(batch.batchName);
    setEditVariety(batch.variety);
    setEditSubstrate(batch.substrate);
    setEditZone(batch.zone);
    setEditStage(batch.currentStage);
    setEditProgress(String(batch.progress));
    setEditHealthScore(String(batch.healthScore));
    setEditYield(batch.yield != null ? String(batch.yield) : "");
    setEditExpectedYield(String(batch.expectedYield));
    setEditNotes(batch.notes || "");
    setIsEditBatchOpen(true);
  };

  const handleEditBatch = async () => {
    if (!canManageBatches) {
      toast.error("Permission Denied", {
        description: `Your role (${role.toUpperCase()}) cannot edit batch parameters.`,
      });
      return;
    }

    if (!editBatchName.trim()) {
      toast.error("Batch name is required.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const updatePayload = {
        batch_name: editBatchName,
        variety: editVariety,
        substrate: editSubstrate,
        zone: editZone,
        current_stage: editStage,
        progress: parseInt(editProgress) || 0,
        health_score: parseInt(editHealthScore) || 90,
        yield: editYield ? parseInt(editYield) : null,
        expected_yield: parseInt(editExpectedYield) || 1000,
        notes: editNotes,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("growth_batches")
        .update(updatePayload)
        .eq("id", editBatchId);

      if (error) {
        toast.error("Failed to update batch", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["growth-batches"] });

      if (selectedBatch?.id === editBatchId) {
        setSelectedBatch((prev) =>
          prev
            ? {
                ...prev,
                batchName: editBatchName,
                variety: editVariety,
                substrate: editSubstrate,
                zone: editZone,
                currentStage: editStage,
                progress: parseInt(editProgress) || 0,
                healthScore: parseInt(editHealthScore) || 90,
                yield: editYield ? parseInt(editYield) : null,
                expectedYield: parseInt(editExpectedYield) || 1000,
                notes: editNotes,
              }
            : null
        );
      }

      logSystemActivity({
        source: "BATCH",
        category: "crud",
        severity: "info",
        action: "UPDATE_BATCH",
        message: `Updated cultivation batch '${editBatchName}' (${editBatchId})`,
        details: `Stage: ${editStage}, Health: ${editHealthScore}%, Yield: ${editYield ? `${editYield}g` : "N/A"}`,
      });

      toast.success("Cultivation Batch Updated", {
        description: `Changes to ${editBatchName} saved successfully.`,
      });
      setIsEditBatchOpen(false);
    } catch {
      toast.error("Failed to update batch.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (!isAdmin && !canManageBatches) {
      toast.error("Permission Denied", {
        description: `Only Operators and Admins can delete batches.`,
      });
      return;
    }

    if (!batchToDelete) return;
    setIsSubmittingDelete(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // 1. Delete associated daily growth logs
      await supabase.from("daily_growth_logs").delete().eq("batch_id", batchToDelete.id);

      // 2. Delete the batch
      const { error } = await supabase
        .from("growth_batches")
        .delete()
        .eq("id", batchToDelete.id);

      if (error) {
        toast.error("Failed to delete batch", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["growth-batches"] });
      queryClient.invalidateQueries({ queryKey: ["daily-growth-logs"] });

      if (selectedBatch?.id === batchToDelete.id) {
        setSelectedBatch(null);
      }

      logSystemActivity({
        source: "BATCH",
        category: "crud",
        severity: "warning",
        action: "DELETE_BATCH",
        message: `Deleted cultivation batch '${batchToDelete.batchName}' (${batchToDelete.id})`,
        details: `Removed batch and associated growth telemetry records.`,
      });

      toast.success("Batch Deleted", {
        description: `${batchToDelete.batchName} has been removed from database.`,
      });
      setIsDeleteDialogOpen(false);
      setBatchToDelete(null);
    } catch {
      toast.error("Failed to delete batch.");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleSeedSampleBatches = async () => {
    setIsSeeding(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const sampleBatches = [
        {
          id: "BATCH-001",
          batch_name: "Batch #01 — Pearl Oyster",
          variety: "Pearl Oyster (Pleurotus ostreatus)",
          substrate: "Rice Straw + Sawdust Mix",
          zone: "Fruiting Bay - Zone A",
          current_stage: "fruiting" as GrowthStage,
          days_since_start: 18,
          progress: 85,
          expected_yield: 1500,
          health_score: 96,
          notes: "Rapid fruiting body expansion under 88% humidity misting.",
          start_date: new Date(Date.now() - 18 * 86400000).toISOString(),
          estimated_harvest_date: new Date(Date.now() + 4 * 86400000).toISOString(),
        },
        {
          id: "BATCH-002",
          batch_name: "Batch #02 — Blue Oyster",
          variety: "Blue Oyster (Pleurotus columbinus)",
          substrate: "Coconut Coir + Rice Bran",
          zone: "Fruiting Bay - Zone B",
          current_stage: "primordia" as GrowthStage,
          days_since_start: 12,
          progress: 60,
          expected_yield: 1200,
          health_score: 92,
          notes: "Dense pinhead formation clusters observed.",
          start_date: new Date(Date.now() - 12 * 86400000).toISOString(),
          estimated_harvest_date: new Date(Date.now() + 10 * 86400000).toISOString(),
        },
        {
          id: "BATCH-003",
          batch_name: "Batch #03 — King Oyster",
          variety: "King Oyster (Pleurotus eryngii)",
          substrate: "Wheat Straw Mix",
          zone: "Incubation Room",
          current_stage: "incubation" as GrowthStage,
          days_since_start: 6,
          progress: 30,
          expected_yield: 1800,
          health_score: 98,
          notes: "Colonization running smoothly without contamination.",
          start_date: new Date(Date.now() - 6 * 86400000).toISOString(),
          estimated_harvest_date: new Date(Date.now() + 20 * 86400000).toISOString(),
        },
        {
          id: "BATCH-004",
          batch_name: "Batch #04 — Pearl Oyster Flush 1",
          variety: "Pearl Oyster (Pleurotus ostreatus)",
          substrate: "Rice Straw + Sawdust Mix",
          zone: "Fruiting Bay - Zone A",
          current_stage: "completed" as GrowthStage,
          days_since_start: 25,
          progress: 100,
          yield: 1450,
          expected_yield: 1400,
          health_score: 94,
          notes: "First flush harvested successfully with prime cap quality.",
          start_date: new Date(Date.now() - 25 * 86400000).toISOString(),
          estimated_harvest_date: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ];

      for (const b of sampleBatches) {
        await supabase.from("growth_batches").upsert(b as any);
      }

      // Sample daily logs
      const sampleLogs = [
        { batch_id: "BATCH-001", date: new Date(Date.now() - 6 * 86400000).toISOString(), height: 1.2, cap_diameter: 0.8, moisture_level: 86, primordia_density: 8 },
        { batch_id: "BATCH-001", date: new Date(Date.now() - 5 * 86400000).toISOString(), height: 2.1, cap_diameter: 1.4, moisture_level: 88, primordia_density: 8 },
        { batch_id: "BATCH-001", date: new Date(Date.now() - 4 * 86400000).toISOString(), height: 3.4, cap_diameter: 2.3, moisture_level: 87, primordia_density: 7 },
        { batch_id: "BATCH-001", date: new Date(Date.now() - 3 * 86400000).toISOString(), height: 4.8, cap_diameter: 3.5, moisture_level: 89, primordia_density: 7 },
        { batch_id: "BATCH-001", date: new Date(Date.now() - 2 * 86400000).toISOString(), height: 6.2, cap_diameter: 4.6, moisture_level: 88, primordia_density: 6 },
        { batch_id: "BATCH-001", date: new Date(Date.now() - 1 * 86400000).toISOString(), height: 7.5, cap_diameter: 5.4, moisture_level: 90, primordia_density: 6 },
        { batch_id: "BATCH-001", date: new Date().toISOString(), height: 8.4, cap_diameter: 6.1, moisture_level: 89, primordia_density: 6 },
      ];

      for (const l of sampleLogs) {
        await supabase.from("daily_growth_logs").insert(l);
      }

      queryClient.invalidateQueries({ queryKey: ["growth-batches"] });
      queryClient.invalidateQueries({ queryKey: ["daily-growth-logs"] });

      // Log in system logs
      logSystemActivity({
        source: "BATCH",
        category: "crud",
        severity: "success",
        action: "SEED_BATCHES",
        message: "Seeded sample oyster mushroom cultivation batches and daily growth curves",
        details: "Loaded 4 batches (Inoculation to Harvest) and 7-day growth curve telemetry.",
      });

      toast.success("Sample Batches Seeded", {
        description: "Populated 4 oyster mushroom batches and 7-day growth telemetry.",
      });
    } catch {
      toast.error("Failed to seed sample batches.");
    } finally {
      setIsSeeding(false);
    }
  };

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
    if (!canManageBatches) {
      toast.error("Permission Denied", {
        description: `Your role (${role.toUpperCase()}) cannot advance growth phases.`,
      });
      return;
    }

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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isViewer && (
              <Badge variant="outline" className="text-[10px] bg-muted/40 font-mono text-muted-foreground border-border/60">
                Read-Only ({role.toUpperCase()})
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (batches.length > 0) setMeasBatchId(batches[0].id);
                setIsLogMeasurementOpen(true);
              }}
              disabled={batches.length === 0 || !canControlDevices}
              className="h-8 text-xs gap-1.5"
            >
              <PlusCircle className="size-3.5" />
              Log Growth
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddBatchOpen(true)}
              disabled={!canManageBatches}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <Plus className="size-3.5" />
              New Batch
            </Button>
          </div>
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

      {/* Centered Modal Dialog: Batch Cultivation Details & Profile (2-Column Layout) */}
      <Dialog open={!!selectedBatch} onOpenChange={(open) => !open && setSelectedBatch(null)}>
        <DialogContent className="sm:max-w-2xl lg:max-w-3xl p-6" showCloseButton={false}>
          <DialogHeader className="pb-3 border-b border-border/40 text-left">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sprout className="size-4 text-primary" />
                Cultivation Batch Profile
              </span>
              {selectedBatch && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider border",
                    STAGE_COLORS[selectedBatch.currentStage]?.bg,
                    STAGE_COLORS[selectedBatch.currentStage]?.text
                  )}
                >
                  {selectedBatch.currentStage}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Biological parameters, growth phase telemetry, and substrate metadata.
            </DialogDescription>
          </DialogHeader>

          {selectedBatch && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 text-xs">
              {/* Column 1: Identity Banner, Substrate, Notes */}
              <div className="space-y-3 flex flex-col justify-between">
                {/* Batch Banner Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/70">
                  <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Sprout className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-bold text-foreground truncate">{selectedBatch.batchName}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{selectedBatch.variety}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">ID: {selectedBatch.id}</p>
                  </div>
                </div>

                {/* Substrate & Colonization Details */}
                <div className="space-y-2 p-3 rounded-xl bg-muted/20 border border-border/60">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Leaf className="size-3.5 text-primary" /> Substrate Composition
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedBatch.substrate}
                  </p>
                  <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">Inoculation:</span>{" "}
                      <p className="font-mono mt-0.5">{selectedBatch.startDate}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Est. Harvest:</span>{" "}
                      <p className="font-mono mt-0.5">{selectedBatch.estimatedHarvestDate}</p>
                    </div>
                  </div>
                </div>

                {/* Observations / Notes */}
                <div className="p-3 rounded-xl bg-muted/10 border border-border/40 flex-1 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Observations / Notes</span>
                  <p className="text-xs text-foreground/80 mt-1 italic">
                    {selectedBatch.notes ? `"${selectedBatch.notes}"` : "No special observations recorded."}
                  </p>
                </div>
              </div>

              {/* Column 2: 2x2 Metric Grid & Advance Phase Action */}
              <div className="space-y-3 flex flex-col justify-between">
                {/* 2x2 Quick Metadata Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <MapPin className="size-3 text-primary" /> Location Zone
                    </span>
                    <p className="font-semibold text-foreground truncate">{selectedBatch.zone}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Heart className="size-3 text-rose-400" /> Health Rating
                    </span>
                    <p className="font-semibold text-foreground font-mono">{selectedBatch.healthScore}% Optimal</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <TrendingUp className="size-3 text-sky-400" /> Progress
                    </span>
                    <p className="font-semibold text-foreground font-mono">
                      {selectedBatch.progress}% ({selectedBatch.daysSinceStart}d)
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Scale className="size-3 text-emerald-400" /> Harvest Yield
                    </span>
                    <p className="font-semibold text-foreground font-mono">
                      {selectedBatch.yield != null ? `${selectedBatch.yield}g` : `~${selectedBatch.expectedYield}g est.`}
                    </p>
                  </div>
                </div>

                {/* Advance Growth Phase */}
                <div className="space-y-2 p-3.5 rounded-xl bg-muted/20 border border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Advance Growth Phase (Live)</Label>
                    {isUpdatingStage && (
                      <span className="text-[11px] text-primary flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" /> Saving...
                      </span>
                    )}
                  </div>
                  <Select
                    value={selectedBatch.currentStage}
                    disabled={!canManageBatches || isUpdatingStage}
                    onValueChange={(v) => handleUpdateStage(v as GrowthStage)}
                  >
                    <SelectTrigger className="h-9 text-xs bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inoculation">Inoculation</SelectItem>
                      <SelectItem value="incubation">Incubation</SelectItem>
                      <SelectItem value="primordia">Primordia (Pinhead)</SelectItem>
                      <SelectItem value="fruiting">Fruiting Body</SelectItem>
                      <SelectItem value="harvest">Harvest</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border/40 pt-3 flex items-center justify-between sm:justify-between w-full">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!isAdmin && !canManageBatches}
              onClick={() => {
                if (selectedBatch) {
                  setBatchToDelete(selectedBatch);
                  setIsDeleteDialogOpen(true);
                }
              }}
              className="text-xs gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canManageBatches}
                onClick={() => {
                  if (selectedBatch) {
                    openEditModal(selectedBatch);
                  }
                }}
                className="text-xs gap-1.5"
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedBatch(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Batch Parameters (Update) */}
      <Dialog open={isEditBatchOpen} onOpenChange={setIsEditBatchOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="size-4 text-primary" />
              Edit Cultivation Batch
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify growth metrics, target yields, and variety metadata for {editBatchName}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Name / Identifier</Label>
              <Input
                value={editBatchName}
                onChange={(e) => setEditBatchName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Oyster Variety</Label>
                <Select value={editVariety} onValueChange={setEditVariety}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pearl Oyster (Pleurotus ostreatus)">Pearl Oyster</SelectItem>
                    <SelectItem value="Blue Oyster (Pleurotus columbinus)">Blue Oyster</SelectItem>
                    <SelectItem value="Pink Oyster (Pleurotus djamor)">Pink Oyster</SelectItem>
                    <SelectItem value="King Oyster (Pleurotus eryngii)">King Oyster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Substrate Mix</Label>
                <Select value={editSubstrate} onValueChange={setEditSubstrate}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rice Straw + Sawdust Mix">Rice Straw + Sawdust Mix</SelectItem>
                    <SelectItem value="Wheat Straw">Wheat Straw</SelectItem>
                    <SelectItem value="Coconut Coir + Rice Bran">Coconut Coir + Rice Bran</SelectItem>
                    <SelectItem value="Coffee Grounds + Sawdust">Coffee Grounds + Sawdust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Greenhouse Zone</Label>
                <Select value={editZone} onValueChange={setEditZone}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fruiting Bay - Zone A">Fruiting Bay - Zone A</SelectItem>
                    <SelectItem value="Fruiting Bay - Zone B">Fruiting Bay - Zone B</SelectItem>
                    <SelectItem value="Incubation Room">Incubation Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Growth Phase</Label>
                <Select value={editStage} onValueChange={(v) => setEditStage(v as GrowthStage)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inoculation">Inoculation</SelectItem>
                    <SelectItem value="incubation">Incubation</SelectItem>
                    <SelectItem value="primordia">Primordia</SelectItem>
                    <SelectItem value="fruiting">Fruiting</SelectItem>
                    <SelectItem value="harvest">Harvest</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Progress (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Health Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editHealthScore}
                  onChange={(e) => setEditHealthScore(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Harvested Yield (g)</Label>
                <Input
                  type="number"
                  value={editYield}
                  onChange={(e) => setEditYield(e.target.value)}
                  placeholder="Leave empty if active"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Expected Yield (g)</Label>
                <Input
                  type="number"
                  value={editExpectedYield}
                  onChange={(e) => setEditExpectedYield(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Cultivation Notes</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Observations, anomalies, flushes..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsEditBatchOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditBatch}
              disabled={isSubmittingEdit}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {isSubmittingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Batch Confirmation (Delete) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Delete Cultivation Batch?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete <strong className="text-foreground">{batchToDelete?.batchName}</strong> ({batchToDelete?.id})? This will permanently remove the batch and its daily growth measurements.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="border-t border-border/40 pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setBatchToDelete(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteBatch}
              disabled={isSubmittingDelete}
              className="text-xs font-semibold"
            >
              {isSubmittingDelete ? "Deleting..." : "Delete Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Create New Batch */}
      <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sprout className="size-4 text-primary" />
              Register New Cultivation Batch
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new oyster mushroom substrate batch into the SmartGrow database.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Name / Identifier</Label>
              <Input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Batch #01 — Pearl Oyster"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Oyster Variety</Label>
                <Select value={variety} onValueChange={setVariety}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pearl Oyster (Pleurotus ostreatus)">Pearl Oyster</SelectItem>
                    <SelectItem value="Blue Oyster (Pleurotus columbinus)">Blue Oyster</SelectItem>
                    <SelectItem value="Pink Oyster (Pleurotus djamor)">Pink Oyster</SelectItem>
                    <SelectItem value="King Oyster (Pleurotus eryngii)">King Oyster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Substrate Mix</Label>
                <Select value={substrate} onValueChange={setSubstrate}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rice Straw + Sawdust Mix">Rice Straw + Sawdust Mix</SelectItem>
                    <SelectItem value="Wheat Straw">Wheat Straw</SelectItem>
                    <SelectItem value="Coconut Coir + Rice Bran">Coconut Coir + Rice Bran</SelectItem>
                    <SelectItem value="Coffee Grounds + Sawdust">Coffee Grounds + Sawdust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Greenhouse Zone</Label>
                <Select value={zone} onValueChange={setZone}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fruiting Bay - Zone A">Fruiting Bay - Zone A</SelectItem>
                    <SelectItem value="Fruiting Bay - Zone B">Fruiting Bay - Zone B</SelectItem>
                    <SelectItem value="Incubation Room">Incubation Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Initial Stage</Label>
                <Select value={currentStage} onValueChange={(v) => setCurrentStage(v as GrowthStage)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inoculation">Inoculation</SelectItem>
                    <SelectItem value="incubation">Incubation</SelectItem>
                    <SelectItem value="primordia">Primordia (Pinhead)</SelectItem>
                    <SelectItem value="fruiting">Fruiting Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Expected Yield (Grams)</Label>
              <Input
                type="number"
                value={expectedYield}
                onChange={(e) => setExpectedYield(e.target.value)}
                placeholder="1000"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Cultivation Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bag preparation, moisture, or inoculation observations..."
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsAddBatchOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddBatch}
              disabled={isSubmittingBatch}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {isSubmittingBatch ? "Saving..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Record Daily Measurement */}
      <Dialog open={isLogMeasurementOpen} onOpenChange={setIsLogMeasurementOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" />
              Record Daily Growth Measurement
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Input caliper and ruler telemetry for active oyster mushroom crops.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Batch</Label>
              <Select value={measBatchId} onValueChange={setMeasBatchId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select active batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.batchName} ({b.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Stalk Height (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={measHeight}
                  onChange={(e) => setMeasHeight(e.target.value)}
                  placeholder="4.5"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cap Diameter (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={measCapDiameter}
                  onChange={(e) => setMeasCapDiameter(e.target.value)}
                  placeholder="3.2"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Substrate Moisture (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={measMoisture}
                  onChange={(e) => setMeasMoisture(e.target.value)}
                  placeholder="86.0"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pinhead Density (per cluster)</Label>
                <Input
                  type="number"
                  value={measPins}
                  onChange={(e) => setMeasPins(e.target.value)}
                  placeholder="8"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsLogMeasurementOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleLogMeasurement}
              disabled={isSubmittingLog}
              className="text-xs bg-primary text-primary-foreground font-semibold"
            >
              {isSubmittingLog ? "Saving..." : "Save Measurement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
