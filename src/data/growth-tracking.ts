/**
 * SmartGrow — Dummy Growth Tracking Data
 *
 * Simulates oyster mushroom growth cycle tracking data.
 * Covers multiple batches at different growth stages.
 */

export type GrowthStage = "inoculation" | "incubation" | "primordia" | "fruiting" | "harvest" | "completed";

export type GrowthBatch = {
  id: string;
  batchName: string;
  substrate: string;
  variety: string;
  zone: string;
  startDate: string;
  currentStage: GrowthStage;
  daysSinceStart: number;
  estimatedHarvestDate: string;
  progress: number;            // 0-100%
  yield: number | null;        // grams, null if not harvested yet
  expectedYield: number;       // grams
  healthScore: number;         // 0-100
  notes: string;
};

export type DailyGrowthLog = {
  date: string;
  batchId: string;
  height: number;         // cm
  capDiameter: number;    // cm
  primordiaDensity: number; // pins per cluster
  moistureLevel: number;  // %
  contamination: boolean;
};

const VARIETIES = [
  "Pearl Oyster (Pleurotus ostreatus)",
  "Blue Oyster (Pleurotus columbinus)",
  "Pink Oyster (Pleurotus djamor)",
  "King Oyster (Pleurotus eryngii)",
];

const SUBSTRATES = [
  "Rice Straw + Sawdust Mix",
  "Wheat Straw",
  "Coconut Coir + Rice Bran",
  "Coffee Grounds + Sawdust",
  "Corn Cob + Rice Hull",
];

const STAGE_ORDER: GrowthStage[] = [
  "inoculation", "incubation", "primordia", "fruiting", "harvest", "completed"
];

function getStageFromDay(day: number): GrowthStage {
  if (day <= 3) return "inoculation";
  if (day <= 18) return "incubation";
  if (day <= 25) return "primordia";
  if (day <= 40) return "fruiting";
  if (day <= 45) return "harvest";
  return "completed";
}

function getProgressFromDay(day: number): number {
  if (day >= 45) return 100;
  return Math.min(100, Math.round((day / 45) * 100));
}

function generateBatches(): GrowthBatch[] {
  const now = new Date();
  const batches: GrowthBatch[] = [];

  const batchConfigs = [
    { daysAgo: 2, zone: "Zone A" },
    { daysAgo: 6, zone: "Zone B" },
    { daysAgo: 12, zone: "Zone B" },
    { daysAgo: 15, zone: "Zone D" },
    { daysAgo: 20, zone: "Zone A" },
    { daysAgo: 22, zone: "Zone A" },
    { daysAgo: 25, zone: "Zone B" },
    { daysAgo: 28, zone: "Zone C" },
    { daysAgo: 32, zone: "Zone A" },
    { daysAgo: 35, zone: "Zone D" },
    { daysAgo: 38, zone: "Zone D" },
    { daysAgo: 42, zone: "Zone B" },
    { daysAgo: 44, zone: "Zone A" },
    { daysAgo: 48, zone: "Zone C" },
    { daysAgo: 50, zone: "Zone B" },
    { daysAgo: 55, zone: "Zone A" },
    { daysAgo: 58, zone: "Zone D" },
    { daysAgo: 62, zone: "Zone C" },
  ];

  batchConfigs.forEach((config, i) => {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - config.daysAgo);
    const estimatedEnd = new Date(startDate);
    estimatedEnd.setDate(estimatedEnd.getDate() + 45);

    const stage = getStageFromDay(config.daysAgo);
    const progress = getProgressFromDay(config.daysAgo);
    const isCompleted = stage === "completed";
    const variety = VARIETIES[i % VARIETIES.length]!;
    const substrate = SUBSTRATES[i % SUBSTRATES.length]!;
    const expectedYield = 800 + Math.floor(Math.random() * 700);
    const healthScore = isCompleted
      ? 75 + Math.floor(Math.random() * 25)
      : stage === "fruiting"
      ? 80 + Math.floor(Math.random() * 20)
      : 85 + Math.floor(Math.random() * 15);

    const notes = {
      inoculation: "Spawn bags inoculated — monitoring for contamination.",
      incubation: "Mycelium colonizing substrate. White growth visible.",
      primordia: "Pin formation detected. Increased misting frequency.",
      fruiting: "Mushrooms developing nicely. Maintaining 85-90% humidity.",
      harvest: "First flush ready for harvest. Good cluster formation.",
      completed: `Harvested ${Math.round(expectedYield * (0.85 + Math.random() * 0.3))}g. Preparing for 2nd flush.`,
    };

    batches.push({
      id: `BATCH-${String(i + 1).padStart(3, "0")}`,
      batchName: `Batch #${i + 1} — ${variety.split("(")[0]!.trim()}`,
      substrate,
      variety,
      zone: config.zone,
      startDate: startDate.toISOString(),
      currentStage: stage,
      daysSinceStart: config.daysAgo,
      estimatedHarvestDate: estimatedEnd.toISOString(),
      progress,
      yield: isCompleted ? Math.round(expectedYield * (0.85 + Math.random() * 0.3)) : null,
      expectedYield,
      healthScore,
      notes: notes[stage],
    });
  });

  return batches;
}

function generateDailyLogs(): DailyGrowthLog[] {
  const logs: DailyGrowthLog[] = [];
  const now = new Date();

  // Generate 30 days of growth logs for batch BATCH-004 (28 days old, in fruiting)
  for (let day = 0; day < 28; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (28 - day));

    const stage = getStageFromDay(day);
    const height = stage === "inoculation" || stage === "incubation"
      ? 0
      : stage === "primordia"
      ? 0.5 + day * 0.3
      : Math.min(12, 2 + (day - 18) * 0.8 + Math.random() * 0.5);

    const capDiameter = stage === "fruiting" || stage === "harvest"
      ? Math.min(10, 1 + (day - 25) * 0.6 + Math.random() * 0.3)
      : 0;

    logs.push({
      date: date.toISOString(),
      batchId: "BATCH-004",
      height: Math.round(height * 10) / 10,
      capDiameter: Math.round(capDiameter * 10) / 10,
      primordiaDensity: stage === "primordia"
        ? Math.round(5 + Math.random() * 15)
        : stage === "fruiting"
        ? Math.round(8 + Math.random() * 12)
        : 0,
      moistureLevel: Math.round((70 + Math.random() * 20) * 10) / 10,
      contamination: Math.random() < 0.03,
    });
  }

  return logs;
}

export const GROWTH_BATCHES: GrowthBatch[] = generateBatches();
export const DAILY_GROWTH_LOGS: DailyGrowthLog[] = generateDailyLogs();

/** Stage color mappings */
export const STAGE_COLORS: Record<GrowthStage, { bg: string; text: string; dot: string }> = {
  inoculation: { bg: "bg-blue-400/10", text: "text-blue-400", dot: "#60a5fa" },
  incubation: { bg: "bg-amber-400/10", text: "text-amber-400", dot: "#fbbf24" },
  primordia: { bg: "bg-violet-400/10", text: "text-violet-400", dot: "#a78bfa" },
  fruiting: { bg: "bg-emerald-400/10", text: "text-emerald-400", dot: "#34d399" },
  harvest: { bg: "bg-orange-400/10", text: "text-orange-400", dot: "#fb923c" },
  completed: { bg: "bg-sky-400/10", text: "text-sky-400", dot: "#38bdf8" },
};

/** Summary for metric cards */
export function getGrowthSummary() {
  const activeBatches = GROWTH_BATCHES.filter((b) => b.currentStage !== "completed").length;
  const completedBatches = GROWTH_BATCHES.filter((b) => b.currentStage === "completed").length;
  const totalYield = GROWTH_BATCHES
    .filter((b) => b.yield != null)
    .reduce((s, b) => s + b.yield!, 0);
  const avgHealth = Math.round(
    GROWTH_BATCHES.reduce((s, b) => s + b.healthScore, 0) / GROWTH_BATCHES.length
  );
  const fruitingBatches = GROWTH_BATCHES.filter((b) => b.currentStage === "fruiting").length;

  return { activeBatches, completedBatches, totalYield, avgHealth, fruitingBatches };
}

/** Growth stage distribution for pie chart */
export function getStageDistribution() {
  const counts: Record<string, number> = {};
  for (const batch of GROWTH_BATCHES) {
    const label = batch.currentStage.charAt(0).toUpperCase() + batch.currentStage.slice(1);
    counts[label] = (counts[label] ?? 0) + 1;
  }

  const colors: Record<string, string> = {
    Inoculation: "#60a5fa",
    Incubation: "#fbbf24",
    Primordia: "#a78bfa",
    Fruiting: "#34d399",
    Harvest: "#fb923c",
    Completed: "#38bdf8",
  };

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: colors[name] ?? "#888",
  }));
}
