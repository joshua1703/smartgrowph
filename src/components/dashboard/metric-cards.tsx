"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Thermometer, Droplets, Fan, Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCards() {
  const { data: latestMetrics } = useQuery({
    queryKey: ["dashboard-overview-metrics"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return null;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // 1. Latest Sensor Reading
      const { data: sr } = await supabase
        .from("sensor_readings")
        .select("temperature, humidity, zone, sensor_name")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // 2. Active Actuators
      const { data: acts } = await supabase
        .from("actuators")
        .select("is_active, type");

      // 3. Latest Active Growth Batch
      const { data: gb } = await supabase
        .from("growth_batches")
        .select("days_since_start, current_stage, batch_name")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const activeActs = (acts || []).filter((a) => a.is_active).length;
      const totalActs = acts?.length || 0;

      const hasSensor = !!sr;
      const tempNum = sr ? Number(sr.temperature) : null;
      const humNum = sr ? Number(sr.humidity) : null;

      return {
        temp: tempNum !== null ? `${tempNum.toFixed(1)}°C` : "—",
        tempBadge: tempNum !== null && tempNum >= 24 && tempNum <= 28 ? "Optimal" : hasSensor ? "Check Range" : "No Feed",
        tempBadgeClass: tempNum !== null && tempNum >= 24 && tempNum <= 28 ? "text-emerald-400 bg-emerald-400/10" : hasSensor ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground bg-muted/40",
        tempSub: sr ? `${sr.sensor_name} — ${sr.zone}` : "No telemetry recorded",

        humidity: humNum !== null ? `${Math.round(humNum)}% RH` : "—",
        humidityBadge: humNum !== null && humNum >= 80 && humNum <= 95 ? "Ideal Range" : hasSensor ? "Outside Range" : "No Feed",
        humidityBadgeClass: humNum !== null && humNum >= 80 && humNum <= 95 ? "text-emerald-400 bg-emerald-400/10" : hasSensor ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground bg-muted/40",
        humiditySub: hasSensor ? "Target: 80–95% RH" : "Awaiting sensor data",

        actuators: totalActs > 0 ? `${activeActs} / ${totalActs} ON` : "0 / 0 ON",
        actuatorBadge: activeActs > 0 ? "Active Relays" : totalActs > 0 ? "All Standby" : "No Hardware",
        actuatorBadgeClass: activeActs > 0 ? "text-violet-400 bg-violet-400/10" : "text-muted-foreground bg-muted/40",
        actuatorSub: totalActs > 0 ? "Hardware relay controller" : "No actuators configured",

        growthDay: gb ? `Day ${gb.days_since_start}` : "No Batches",
        growthBadge: gb ? `${gb.current_stage.toUpperCase()}` : "Inactive",
        growthBadgeClass: gb ? "text-emerald-400 bg-emerald-400/10" : "text-muted-foreground bg-muted/40",
        growthSub: gb ? gb.batch_name : "No cultivation batch in database",
      };
    },
    refetchInterval: 4000,
  });

  const metrics = [
    {
      title: "Temperature",
      value: latestMetrics?.temp || "—",
      icon: Thermometer,
      gradient: "from-rose-500/5",
      iconClass: "text-rose-400",
      badge: latestMetrics?.tempBadge || "No Feed",
      badgeClass: latestMetrics?.tempBadgeClass || "text-muted-foreground bg-muted/40",
      sub: latestMetrics?.tempSub || "No telemetry recorded",
    },
    {
      title: "Humidity",
      value: latestMetrics?.humidity || "—",
      icon: Droplets,
      gradient: "from-sky-500/5",
      iconClass: "text-sky-400",
      badge: latestMetrics?.humidityBadge || "No Feed",
      badgeClass: latestMetrics?.humidityBadgeClass || "text-muted-foreground bg-muted/40",
      sub: latestMetrics?.humiditySub || "Awaiting sensor data",
    },
    {
      title: "Actuator Status",
      value: latestMetrics?.actuators || "0 / 0 ON",
      icon: Fan,
      gradient: "from-violet-500/5",
      iconClass: "text-violet-400",
      badge: latestMetrics?.actuatorBadge || "Standby",
      badgeClass: latestMetrics?.actuatorBadgeClass || "text-muted-foreground bg-muted/40",
      sub: latestMetrics?.actuatorSub || "Hardware relay controller",
    },
    {
      title: "Growth Cycle",
      value: latestMetrics?.growthDay || "No Batches",
      icon: Sprout,
      gradient: "from-emerald-500/5",
      iconClass: "text-emerald-400",
      badge: latestMetrics?.growthBadge || "Inactive",
      badgeClass: latestMetrics?.growthBadgeClass || "text-muted-foreground bg-muted/40",
      sub: latestMetrics?.growthSub || "No cultivation batch in database",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
      {metrics.map((m) => (
        <Card key={m.title} className="bg-card border-border shadow-md rounded-2xl overflow-hidden relative group py-0">
          <div className={cn("absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none", m.gradient)} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2 relative z-10 mb-4">
            <div className="flex items-center gap-2">
              <m.icon className={cn("h-3.5 w-3.5", m.iconClass)} />
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 relative z-10">
            <div className="text-2xl font-bold mb-0.5 tracking-tight">{m.value}</div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", m.badgeClass)}>{m.badge}</span>
              <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
