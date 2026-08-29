"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Cpu } from "lucide-react";

/**
 * Actuator Usage vs. Capacity gauge.
 * Queries actuators and calculates real logged runtime against daily capacity limits.
 */
export function ActuatorCapacityGauge() {
  const { data: usageData = [] } = useQuery({
    queryKey: ["actuator-capacity-data"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // Fetch defined actuators
      const { data: actuators } = await supabase
        .from("actuators")
        .select("*")
        .order("name", { ascending: true });

      if (!actuators || actuators.length === 0) return [];

      // Fetch actuator logs from today
      const { data: logs } = await supabase
        .from("actuator_logs")
        .select("actuator_id, duration")
        .order("created_at", { ascending: false })
        .limit(100);

      const colorMap: Record<string, string> = {
        fan: "#10b981",
        fogger: "#38bdf8",
        sprinkler: "#a855f7",
        led: "#fbbf24",
      };

      const maxCapMap: Record<string, number> = {
        fan: 12,
        fogger: 8,
        sprinkler: 4,
        led: 16,
      };

      return actuators.map((a) => {
        const matchingLogs = (logs || []).filter((l) => l.actuator_id === a.id);
        const totalMinutes = matchingLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
        const dailyRuntime = Number((totalMinutes / 60).toFixed(1));
        const maxCapacity = maxCapMap[a.type] || 10;
        const color = colorMap[a.type] || "#10b981";

        return {
          id: a.id,
          actuator: a.name,
          dailyRuntime,
          maxCapacity,
          color,
          isActive: a.is_active,
        };
      });
    },
    refetchInterval: 5000,
  });

  if (usageData.length === 0) {
    return (
      <div className="h-[240px] w-full flex flex-col items-center justify-center text-center p-6 bg-muted/10 rounded-xl border border-dashed border-border/60 text-muted-foreground">
        <Cpu className="size-8 text-muted-foreground/40 mb-2 animate-pulse" />
        <p className="text-xs font-semibold text-foreground">No actuators configured in database</p>
        <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
          Actuator capacity metrics will render once hardware units are connected to Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {usageData.map((row) => {
        const pct = Math.min(
          100,
          Math.round((row.dailyRuntime / row.maxCapacity) * 100),
        );
        const isHighUsage = pct >= 85;
        const isOverCapacity = pct >= 95;

        return (
          <div key={row.id} className="space-y-1.5">
            {/* Labels row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-xs">
              <span className="font-bold text-foreground truncate">
                {row.actuator}
              </span>
              <div className="flex items-center gap-1 tabular-nums text-muted-foreground/80 flex-wrap">
                <span
                  className="font-bold"
                  style={{
                    color: isOverCapacity
                      ? "#ef4444"
                      : isHighUsage
                      ? "#f59e0b"
                      : row.color,
                  }}
                >
                  {row.dailyRuntime}h
                </span>
                <span className="text-[10px] opacity-40">used /</span>
                <span className="font-semibold">{row.maxCapacity}h</span>
                <span className="text-[10px] opacity-40">capacity</span>
                <span className="ml-auto sm:ml-1 text-[10px] font-bold text-muted-foreground/60">
                  ({pct}%)
                </span>
              </div>
            </div>

            {/* Bullet bar */}
            <div className="relative h-6 w-full overflow-hidden rounded-lg bg-muted/20 border border-border/5">
              {/* Usage zone backgrounds */}
              <div
                className="absolute inset-y-0 left-0 opacity-10"
                style={{ width: "70%", background: "#22c55e" }}
              />
              <div
                className="absolute inset-y-0 opacity-10"
                style={{ left: "70%", width: "15%", background: "#f59e0b" }}
              />
              <div
                className="absolute inset-y-0 opacity-10"
                style={{ left: "85%", width: "15%", background: "#ef4444" }}
              />

              {/* Usage bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${row.color}bb, ${row.color})`,
                  boxShadow: `0 0 15px ${row.color}30`,
                }}
              />

              {/* Capacity limit marker */}
              <div
                className="absolute inset-y-0 w-1 bg-foreground/30"
                style={{ left: "100%" }}
              />

              {/* 85% warning threshold */}
              <div
                className="absolute inset-y-0 w-px bg-amber-500/40"
                style={{ left: "85%" }}
              />
            </div>

            {/* Status indicator */}
            <div className="flex items-start gap-2 text-[10px] leading-tight">
              <span
                className="mt-1 size-1.5 shrink-0 rounded-full animate-pulse"
                style={{
                  background: isOverCapacity
                    ? "#ef4444"
                    : isHighUsage
                    ? "#f59e0b"
                    : "#22c55e",
                }}
              />
              <span className="font-medium text-muted-foreground/80">
                {isOverCapacity
                  ? "Over capacity — check actuator health"
                  : isHighUsage
                  ? "High utilization — monitor performance"
                  : row.dailyRuntime > 0
                  ? "Normal operation within capacity"
                  : "Standby — 0h runtime today"}
              </span>
            </div>
          </div>
        );
      })}

      {/* Footer legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border/40 pt-4">
        {[
          { label: "Normal", color: "#22c55e", sub: "<70%" },
          { label: "High Use", color: "#f59e0b", sub: "70-85%" },
          { label: "Over Cap.", color: "#ef4444", sub: ">85%" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-sm opacity-50"
              style={{ background: item.color }}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-none">
                {item.label}
              </span>
              <span className="text-[8px] font-medium text-muted-foreground/40 mt-0.5">
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
