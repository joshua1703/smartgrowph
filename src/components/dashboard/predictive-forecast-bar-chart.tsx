"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

const BAR_TEMP = "#ef4444";
const BAR_HUMIDITY = "#38bdf8";
const BAR_FAN = "#10b981";

function BarTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: ReadonlyArray<{ name?: string; value?: number; color?: string }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl",
        "text-popover-foreground",
      )}
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.name)} className="flex justify-between gap-6 text-muted-foreground">
            <span>{p.name}</span>
            <span className="font-semibold tabular-nums text-foreground">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PredictiveForecastBarChart() {
  const { data: chartData = [] } = useQuery({
    queryKey: ["weekly-forecast-data"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const { data: readings } = await supabase
        .from("sensor_readings")
        .select("created_at, temperature, humidity")
        .order("created_at", { ascending: false })
        .limit(100);

      const { data: logs } = await supabase
        .from("actuator_logs")
        .select("created_at, duration, actuator_type")
        .eq("actuator_type", "fan")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!readings || readings.length === 0) return [];

      const totalTemp = readings.reduce((acc, r) => acc + Number(r.temperature), 0);
      const totalHum = readings.reduce((acc, r) => acc + Number(r.humidity), 0);
      const avgTemp = Number((totalTemp / readings.length).toFixed(1));
      const avgHumidity = Math.round(totalHum / readings.length);

      const totalFanMin = (logs || []).reduce((acc, l) => acc + (l.duration || 0), 0);
      const fanRuntime = Number((totalFanMin / 60).toFixed(1));

      return [
        { week: "Current Week", avgTemp, avgHumidity, fanRuntime },
      ];
    },
    refetchInterval: 5000,
  });

  return (
    <div className="h-[300px] w-full md:h-[320px]">
      {chartData.length === 0 ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
          <BarChart3 className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
          <p className="text-xs font-semibold text-foreground">No historical data in database</p>
          <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
            Weekly trends and resource usage will plot when sensor telemetry and fan runtimes are recorded.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            barGap={2}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/80" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<BarTooltip />} cursor={false} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value) => (
                <span className="text-muted-foreground capitalize">{String(value)}</span>
              )}
            />
            <Bar
              dataKey="avgTemp"
              name="Avg Temp (°C)"
              fill={BAR_TEMP}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="avgHumidity"
              name="Avg Humidity (%)"
              fill={BAR_HUMIDITY}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="fanRuntime"
              name="Fan Runtime (hrs)"
              fill={BAR_FAN}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
