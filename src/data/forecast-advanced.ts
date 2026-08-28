/**
 * SmartGrow — Actuator usage data for the IoT Smart Greenhouse System.
 *
 * System: DHT22 sensor → ESP32 → PHP backend → MySQL
 * Actuators: Fan, Fogger, Sprinkler, Exhaust Vent
 */

import { WEEK7_FORECAST_ROW } from "./resource-forecast";

/* ────────────────────────────────────────────────────────
   ACTUATOR RUNTIME vs. CAPACITY
   ──────────────────────────────────────────────────────── */

export type ActuatorUsageRow = {
  actuator: string;
  dailyRuntime: number;
  maxCapacity: number;
  color: string;
};

/**
 * Compares predicted actuator runtime demand against available daily capacity.
 * Managed by the ESP32 control system.
 */
export const ACTUATOR_USAGE_DATA: ActuatorUsageRow[] = [
  {
    actuator: "Fan (Cooling)",
    dailyRuntime: Math.round(WEEK7_FORECAST_ROW.fanRuntime * 6),
    maxCapacity: 48,
    color: "#38bdf8",
  },
  {
    actuator: "Fogger (Humidity)",
    dailyRuntime: Math.round(WEEK7_FORECAST_ROW.foggerRuntime * 5),
    maxCapacity: 40,
    color: "#10b981",
  },
  {
    actuator: "Sprinkler (Watering)",
    dailyRuntime: Math.round(WEEK7_FORECAST_ROW.fanRuntime * 2.5),
    maxCapacity: 24,
    color: "#a855f7",
  },
  {
    actuator: "Exhaust Vent (CO₂)",
    dailyRuntime: Math.round(WEEK7_FORECAST_ROW.fanRuntime * 3),
    maxCapacity: 30,
    color: "#f59e0b",
  },
];
