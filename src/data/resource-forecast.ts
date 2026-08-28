/**
 * SmartGrow — IoT Smart Greenhouse Sensor Data for Oyster Mushroom Cultivation.
 *
 * Simulates weekly environmental readings from the DHT22 sensor connected
 * to the ESP32 microcontroller. Data is collected and stored via the PHP
 * backend into a MySQL database.
 *
 * Ideal growing conditions for oyster mushrooms:
 *   - Temperature: 24–28 °C (fruiting), 20–30 °C (incubation)
 *   - Humidity: 80–95% RH
 */
export type SensorWeekRow = {
  week: string;
  avgTemp: number;     // °C average temperature
  avgHumidity: number; // % RH average humidity
  fanRuntime: number;  // hours fan was active
  foggerRuntime: number; // hours fogger was active
  projected?: boolean;
};

const WEEKS_1_TO_6: SensorWeekRow[] = [
  { week: "Week 1", avgTemp: 26.4, avgHumidity: 87, fanRuntime: 4.2, foggerRuntime: 6.8 },
  { week: "Week 2", avgTemp: 27.1, avgHumidity: 84, fanRuntime: 5.6, foggerRuntime: 8.1 },
  { week: "Week 3", avgTemp: 27.8, avgHumidity: 82, fanRuntime: 6.4, foggerRuntime: 9.5 },
  { week: "Week 4", avgTemp: 28.3, avgHumidity: 80, fanRuntime: 7.8, foggerRuntime: 10.2 },
  { week: "Week 5", avgTemp: 27.5, avgHumidity: 85, fanRuntime: 5.9, foggerRuntime: 7.6 },
  { week: "Week 6", avgTemp: 26.8, avgHumidity: 89, fanRuntime: 4.1, foggerRuntime: 5.3 },
];

function projectNext(values: number[]): number {
  const n = values.length;
  if (n < 2) return Math.round((values[0] ?? 0) * 10) / 10;
  const last = values[n - 1]!;
  const prev = values[n - 2]!;
  const trend = last - prev;
  return Math.round((last + trend * 0.8) * 10) / 10;
}

const week7: SensorWeekRow = {
  week: "Week 7 (pred.)",
  avgTemp: projectNext(WEEKS_1_TO_6.map((r) => r.avgTemp)),
  avgHumidity: projectNext(WEEKS_1_TO_6.map((r) => r.avgHumidity)),
  fanRuntime: projectNext(WEEKS_1_TO_6.map((r) => r.fanRuntime)),
  foggerRuntime: projectNext(WEEKS_1_TO_6.map((r) => r.foggerRuntime)),
  projected: true,
};

export const SENSOR_WEEKLY_SUMMARY: SensorWeekRow[] = [...WEEKS_1_TO_6, week7];

export const SENSOR_WEEKLY_CHART_ROWS = SENSOR_WEEKLY_SUMMARY;

/** For pie / radial: Actuator usage distribution in last cycle */
export function getActuatorUsageMix() {
  const totalFan = WEEKS_1_TO_6.reduce((s, r) => s + r.fanRuntime, 0);
  const totalFogger = WEEKS_1_TO_6.reduce((s, r) => s + r.foggerRuntime, 0);
  const totalSprinkler = Math.round(totalFan * 0.4); // sprinkler runs ~40% of fan time
  const total = totalFan + totalFogger + totalSprinkler;
  return [
    {
      name: "Fan",
      value: Math.round(totalFan),
      fill: "#38bdf8",
      pct: total ? Math.round((totalFan / total) * 100) : 0,
    },
    {
      name: "Fogger",
      value: Math.round(totalFogger),
      fill: "#10b981",
      pct: total ? Math.round((totalFogger / total) * 100) : 0,
    },
    {
      name: "Sprinkler",
      value: Math.round(totalSprinkler),
      fill: "#a855f7",
      pct: total ? Math.round((totalSprinkler / total) * 100) : 0,
    },
  ];
}

export { week7 as WEEK7_FORECAST_ROW };
