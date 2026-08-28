/**
 * SmartGrow — Dummy Actuator Logs Data
 *
 * Simulates actuator event logs from the ESP32 microcontroller.
 * Tracks fan, fogger, sprinkler, and LED grow light operations.
 */

export type ActuatorLog = {
  id: string;
  timestamp: string;
  actuatorId: string;
  actuatorName: string;
  actuatorType: "fan" | "fogger" | "sprinkler" | "led";
  zone: string;
  action: "activated" | "deactivated" | "error" | "maintenance";
  trigger: "auto" | "manual" | "schedule" | "emergency";
  duration: number | null;  // minutes, null if still running or error
  reason: string;
  powerConsumption: number; // watts
};

const ACTUATORS = [
  { id: "FAN-01", name: "Exhaust Fan A", type: "fan" as const, zone: "Zone A", wattBase: 45 },
  { id: "FAN-02", name: "Exhaust Fan B", type: "fan" as const, zone: "Zone B", wattBase: 45 },
  { id: "FOG-01", name: "Fogger Unit 1", type: "fogger" as const, zone: "Zone A", wattBase: 35 },
  { id: "FOG-02", name: "Fogger Unit 2", type: "fogger" as const, zone: "Zone C", wattBase: 35 },
  { id: "SPR-01", name: "Sprinkler System", type: "sprinkler" as const, zone: "Zone D", wattBase: 60 },
  { id: "LED-01", name: "LED Grow Light A", type: "led" as const, zone: "Zone A", wattBase: 120 },
  { id: "LED-02", name: "LED Grow Light B", type: "led" as const, zone: "Zone B", wattBase: 120 },
];

const REASONS: Record<string, string[]> = {
  fan: [
    "Temperature exceeded 28°C threshold",
    "CO₂ level above 600ppm — ventilation needed",
    "Scheduled hourly ventilation cycle",
    "Manual activation by operator",
    "Temperature normalized below 27°C",
    "Ventilation cycle completed",
  ],
  fogger: [
    "Humidity dropped below 80% RH",
    "Humidity reached target 90% RH",
    "Scheduled misting cycle",
    "Fruiting stage moisture boost",
    "Humidity sensor recalibration",
    "Target humidity reached",
  ],
  sprinkler: [
    "Soil moisture below 60%",
    "Scheduled watering cycle",
    "Manual watering triggered",
    "Soil saturation reached",
    "Post-harvest substrate hydration",
    "Watering cycle completed",
  ],
  led: [
    "Photoperiod started (12hr cycle)",
    "Photoperiod ended",
    "Light intensity adjustment",
    "Supplemental lighting for overcast day",
    "Scheduled light-off period",
    "Energy saving mode activated",
  ],
};

function generateLogs(): ActuatorLog[] {
  const logs: ActuatorLog[] = [];
  const now = new Date();
  let idx = 0;

  for (let day = 6; day >= 0; day--) {
    // Generate 8–14 events per day
    const eventsPerDay = 8 + Math.floor(Math.random() * 7);
    for (let e = 0; e < eventsPerDay; e++) {
      const actuator = ACTUATORS[Math.floor(Math.random() * ACTUATORS.length)]!;
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      const isError = Math.random() < 0.05;
      const isMaintenance = !isError && Math.random() < 0.03;
      const isActivation = !isError && !isMaintenance && Math.random() < 0.55;

      const action: ActuatorLog["action"] = isError
        ? "error"
        : isMaintenance
        ? "maintenance"
        : isActivation
        ? "activated"
        : "deactivated";

      const triggers: ActuatorLog["trigger"][] = ["auto", "manual", "schedule", "emergency"];
      const trigger = isError
        ? "emergency"
        : isMaintenance
        ? "manual"
        : triggers[Math.floor(Math.random() * 3)]!;

      const reasons = REASONS[actuator.type]!;
      const reason = reasons[Math.floor(Math.random() * reasons.length)]!;

      const duration = action === "deactivated"
        ? Math.round(5 + Math.random() * 55)
        : action === "error"
        ? null
        : action === "maintenance"
        ? Math.round(15 + Math.random() * 45)
        : null;

      logs.push({
        id: `AL-${String(++idx).padStart(5, "0")}`,
        timestamp: date.toISOString(),
        actuatorId: actuator.id,
        actuatorName: actuator.name,
        actuatorType: actuator.type,
        zone: actuator.zone,
        action,
        trigger,
        duration,
        reason,
        powerConsumption: Math.round(actuator.wattBase * (0.8 + Math.random() * 0.4)),
      });
    }
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const ACTUATOR_LOGS: ActuatorLog[] = generateLogs();

/** Summary stats */
export function getActuatorSummary() {
  const totalEvents = ACTUATOR_LOGS.length;
  const errors = ACTUATOR_LOGS.filter((l) => l.action === "error").length;
  const totalRuntime = ACTUATOR_LOGS
    .filter((l) => l.duration != null)
    .reduce((s, l) => s + l.duration!, 0);
  const avgPower = Math.round(
    ACTUATOR_LOGS.reduce((s, l) => s + l.powerConsumption, 0) / totalEvents
  );
  const autoEvents = ACTUATOR_LOGS.filter((l) => l.trigger === "auto").length;
  const autoPercent = Math.round((autoEvents / totalEvents) * 100);

  return { totalEvents, errors, totalRuntime, avgPower, autoPercent };
}

/** Events per actuator type for breakdown chart */
export function getActuatorTypeBreakdown() {
  const counts: Record<string, number> = {};
  for (const log of ACTUATOR_LOGS) {
    counts[log.actuatorType] = (counts[log.actuatorType] ?? 0) + 1;
  }

  return [
    { name: "Fan", value: counts["fan"] ?? 0, fill: "#38bdf8" },
    { name: "Fogger", value: counts["fogger"] ?? 0, fill: "#10b981" },
    { name: "Sprinkler", value: counts["sprinkler"] ?? 0, fill: "#a855f7" },
    { name: "LED Light", value: counts["led"] ?? 0, fill: "#f59e0b" },
  ];
}

/** Daily event count for the last 7 days */
export function getDailyEventCounts() {
  const now = new Date();
  const days: { day: string; activations: number; deactivations: number; errors: number }[] = [];

  for (let d = 6; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const dayLogs = ACTUATOR_LOGS.filter((l) => {
      const logDate = new Date(l.timestamp);
      return logDate.toDateString() === date.toDateString();
    });

    days.push({
      day: dateStr,
      activations: dayLogs.filter((l) => l.action === "activated").length,
      deactivations: dayLogs.filter((l) => l.action === "deactivated").length,
      errors: dayLogs.filter((l) => l.action === "error").length,
    });
  }

  return days;
}
