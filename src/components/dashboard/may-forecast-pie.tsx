"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: number; payload?: { pct?: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0]!;
  const pct = p.payload?.pct;
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl",
        "text-popover-foreground",
      )}
    >
      <p className="font-semibold">{p.name}</p>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{p.value}</span> hours
        {pct != null ? <span className="text-muted-foreground"> · {pct}% of total</span> : null}
      </p>
    </div>
  );
}

export function MayForecastPie() {
  const { data = [] } = useQuery({
    queryKey: ["actuator-usage-mix"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data: logs } = await supabase
        .from("actuator_logs")
        .select("actuator_type, duration")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!logs || logs.length === 0) return [];

      const map: Record<string, number> = { fan: 0, fogger: 0, sprinkler: 0, led: 0 };
      logs.forEach((l) => {
        if (map[l.actuator_type] !== undefined) {
          map[l.actuator_type] += l.duration || 10;
        }
      });

      const totalMinutes = Object.values(map).reduce((a, b) => a + b, 0);
      if (totalMinutes === 0) return [];

      const raw = [
        { name: "Fans", minutes: map.fan, fill: "#10b981" },
        { name: "Foggers", minutes: map.fogger, fill: "#38bdf8" },
        { name: "Sprinklers", minutes: map.sprinkler, fill: "#a855f7" },
        { name: "LED Lights", minutes: map.led, fill: "#fbbf24" },
      ].filter((d) => d.minutes > 0);

      return raw.map((d) => ({
        name: d.name,
        value: Number((d.minutes / 60).toFixed(1)),
        pct: Math.round((d.minutes / totalMinutes) * 100),
        fill: d.fill,
      }));
    },
    refetchInterval: 5000,
  });

  return (
    <div className="flex h-[300px] w-full flex-col md:h-[320px]">
      {data.length === 0 ? (
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
          <Layers className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
          <p className="text-xs font-semibold text-foreground">No device runtimes in database</p>
          <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
            Usage distribution will plot when actuators log runtime durations in Supabase.
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
                stroke="var(--background)"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="-mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {data.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: d.fill }} />
                {d.name}{" "}
                <span className="tabular-nums text-foreground">{d.pct}%</span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Actuator usage distribution — current growth cycle
          </p>
        </>
      )}
    </div>
  );
}
