"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Radio } from "lucide-react";

const TEMP_COLOR = "#ef4444";
const HUMIDITY_COLOR = "#38bdf8";
const FAN_COLOR = "#10b981";

export function ServiceImpactChart() {
  const { data: chartData = [] } = useQuery({
    queryKey: ["service-impact-telemetry"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // 1. Fetch sensor readings
      const { data: readings } = await supabase
        .from("sensor_readings")
        .select("created_at, temperature, humidity")
        .order("created_at", { ascending: false })
        .limit(100);

      // 2. Fetch fan actuator logs
      const { data: logs } = await supabase
        .from("actuator_logs")
        .select("created_at, duration, actuator_type")
        .eq("actuator_type", "fan")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!readings || readings.length === 0) return [];

      const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
      const grouped: Record<string, { temps: number[]; hums: number[]; fanMinutes: number }> = {};
      hours.forEach((h) => {
        grouped[h] = { temps: [], hums: [], fanMinutes: 0 };
      });

      readings.forEach((r) => {
        const d = new Date(r.created_at);
        if (!isNaN(d.getTime())) {
          const hour = d.getHours();
          const slot = `${String(Math.floor(hour / 2) * 2).padStart(2, "0")}:00`;
          if (grouped[slot]) {
            grouped[slot].temps.push(Number(r.temperature));
            grouped[slot].hums.push(Number(r.humidity));
          }
        }
      });

      if (logs) {
        logs.forEach((l) => {
          const d = new Date(l.created_at);
          if (!isNaN(d.getTime())) {
            const hour = d.getHours();
            const slot = `${String(Math.floor(hour / 2) * 2).padStart(2, "0")}:00`;
            if (grouped[slot]) {
              grouped[slot].fanMinutes += l.duration || 0;
            }
          }
        });
      }

      return hours
        .map((date) => {
          const g = grouped[date];
          if (g.temps.length === 0) return null;
          const avgTemp = Number((g.temps.reduce((a, b) => a + b, 0) / g.temps.length).toFixed(1));
          const avgHum = Math.round(g.hums.reduce((a, b) => a + b, 0) / g.hums.length);
          const fanHrs = Number((g.fanMinutes / 60).toFixed(1));
          return { date, temp: avgTemp, humidity: avgHum, fanHrs };
        })
        .filter(Boolean) as { date: string; temp: number; humidity: number; fanHrs: number }[];
    },
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-4">
      <div className="h-[280px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
            <Radio className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-foreground">No environmental telemetry recorded yet</p>
            <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
              Environmental curves will plot in real time as sensor readings and fan logs are received in Supabase.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -8, bottom: 4 }}
            >
              <defs>
                <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEMP_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={TEMP_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={HUMIDITY_COLOR} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={HUMIDITY_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillFan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FAN_COLOR} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={FAN_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                className="fill-muted-foreground"
                axisLine={false}
                tickLine={false}
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
                  const row = payload[0]?.payload as { temp: number; humidity: number; fanHrs: number } | undefined;
                  if (!row) return null;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {label}
                      </p>
                      <div className="space-y-0.5">
                        <p>
                          <span className="font-semibold" style={{ color: TEMP_COLOR }}>
                            {row.temp}°C
                          </span>{" "}
                          <span className="text-muted-foreground">temperature</span>
                        </p>
                        <p>
                          <span className="font-semibold" style={{ color: HUMIDITY_COLOR }}>
                            {row.humidity}%
                          </span>{" "}
                          <span className="text-muted-foreground">humidity (RH)</span>
                        </p>
                        <p>
                          <span className="font-semibold" style={{ color: FAN_COLOR }}>
                            {row.fanHrs}h
                          </span>{" "}
                          <span className="text-muted-foreground">fan runtime</span>
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={TEMP_COLOR}
                strokeWidth={2}
                fill="url(#fillTemp)"
              />
              <Area
                type="monotone"
                dataKey="humidity"
                stroke={HUMIDITY_COLOR}
                strokeWidth={2}
                fill="url(#fillHumidity)"
              />
              <Area
                type="monotone"
                dataKey="fanHrs"
                stroke={FAN_COLOR}
                strokeWidth={2}
                fill="url(#fillFan)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {chartData.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ background: TEMP_COLOR }}
            />
            Temperature (°C)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: HUMIDITY_COLOR }} />
            Humidity (% RH)
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: FAN_COLOR }} />
            Fan Runtime (hrs)
          </span>
        </div>
      )}
    </div>
  );
}
