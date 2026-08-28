/**
 * SmartGrow — Dummy Sensor Readings Data
 *
 * Simulates individual DHT22 sensor readings logged every 2 hours
 * from the ESP32 microcontroller into the MySQL database.
 *
 * Covers the last 7 days for a realistic sensor readings page.
 */

export type SensorReading = {
  id: string;
  timestamp: string;       // ISO string
  sensorId: string;
  sensorName: string;
  zone: string;
  temperature: number;     // °C
  humidity: number;        // % RH
  soilMoisture: number;    // % (0-100)
  co2Level: number;        // ppm
  lightIntensity: number;  // lux
  status: "normal" | "warning" | "critical";
};

function generateId(i: number): string {
  return `SR-${String(i + 1).padStart(5, "0")}`;
}

function getStatus(temp: number, humidity: number): SensorReading["status"] {
  if (temp > 30 || temp < 20 || humidity < 70 || humidity > 98) return "critical";
  if (temp > 28.5 || temp < 22 || humidity < 78 || humidity > 95) return "warning";
  return "normal";
}

const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];
const SENSORS = [
  { id: "DHT22-A1", name: "DHT22 Sensor A1", zone: "Zone A" },
  { id: "DHT22-B1", name: "DHT22 Sensor B1", zone: "Zone B" },
  { id: "DHT22-C1", name: "DHT22 Sensor C1", zone: "Zone C" },
  { id: "DHT22-D1", name: "DHT22 Sensor D1", zone: "Zone D" },
];

function generateReadings(): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = new Date();
  let idx = 0;

  for (let day = 6; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour += 2) {
      for (const sensor of SENSORS) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);
        date.setHours(hour, 0, 0, 0);

        // Simulate diurnal temperature cycle (peaks at 14:00)
        const hourFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5;
        const dayVariation = (Math.random() - 0.5) * 1.5;
        const baseTemp = 25.5 + hourFactor * 3.2 + dayVariation;
        const temp = Math.round(baseTemp * 10) / 10;

        // Inverse correlation with temperature
        const baseHumidity = 92 - hourFactor * 12 + (Math.random() - 0.5) * 4;
        const humidity = Math.round(Math.min(98, Math.max(70, baseHumidity)) * 10) / 10;

        // Soil moisture stays relatively stable
        const soilMoisture = Math.round((65 + Math.random() * 20) * 10) / 10;

        // CO2 levels
        const co2Level = Math.round(400 + Math.random() * 300 + hourFactor * 150);

        // Light intensity (peaks midday)
        const lightBase = hour >= 6 && hour <= 18
          ? Math.sin(((hour - 6) / 12) * Math.PI) * 800
          : 0;
        const lightIntensity = Math.round(lightBase + Math.random() * 50);

        readings.push({
          id: generateId(idx++),
          timestamp: date.toISOString(),
          sensorId: sensor.id,
          sensorName: sensor.name,
          zone: sensor.zone,
          temperature: temp,
          humidity,
          soilMoisture,
          co2Level,
          lightIntensity,
          status: getStatus(temp, humidity),
        });
      }
    }
  }

  return readings.reverse(); // most recent first
}

export const SENSOR_READINGS: SensorReading[] = generateReadings();

/** Summary stats for the metric cards */
export function getSensorSummary() {
  const latest = SENSOR_READINGS.slice(0, SENSORS.length); // latest reading per sensor
  const avgTemp = Math.round(latest.reduce((s, r) => s + r.temperature, 0) / latest.length * 10) / 10;
  const avgHumidity = Math.round(latest.reduce((s, r) => s + r.humidity, 0) / latest.length * 10) / 10;
  const criticalCount = SENSOR_READINGS.filter((r) => r.status === "critical").length;
  const warningCount = SENSOR_READINGS.filter((r) => r.status === "warning").length;
  const totalReadings = SENSOR_READINGS.length;

  return { avgTemp, avgHumidity, criticalCount, warningCount, totalReadings };
}

/** Hourly averages for the last 24 hours (for charts) */
export function getLast24HoursAvg() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent = SENSOR_READINGS.filter((r) => new Date(r.timestamp) >= oneDayAgo);

  const byHour = new Map<number, SensorReading[]>();
  for (const r of recent) {
    const h = new Date(r.timestamp).getHours();
    if (!byHour.has(h)) byHour.set(h, []);
    byHour.get(h)!.push(r);
  }

  const result: { hour: string; temperature: number; humidity: number; co2: number }[] = [];
  for (let h = 0; h < 24; h += 2) {
    const group = byHour.get(h) ?? [];
    if (group.length === 0) continue;
    result.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      temperature: Math.round(group.reduce((s, r) => s + r.temperature, 0) / group.length * 10) / 10,
      humidity: Math.round(group.reduce((s, r) => s + r.humidity, 0) / group.length * 10) / 10,
      co2: Math.round(group.reduce((s, r) => s + r.co2Level, 0) / group.length),
    });
  }

  return result;
}
