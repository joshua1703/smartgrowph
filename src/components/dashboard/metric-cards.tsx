import { Thermometer, Droplets, Fan, Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const metrics = [
  {
    title: "Temperature",
    value: "26.8°C",
    icon: Thermometer,
    gradient: "from-rose-500/5",
    iconClass: "text-rose-400",
    badge: "Optimal",
    badgeClass: "text-emerald-400 bg-emerald-400/10",
    sub: "DHT22 Sensor — Zone A",
  },
  {
    title: "Humidity",
    value: "89% RH",
    icon: Droplets,
    gradient: "from-sky-500/5",
    iconClass: "text-sky-400",
    badge: "Ideal Range",
    badgeClass: "text-emerald-400 bg-emerald-400/10",
    sub: "Target: 80–95% RH",
  },
  {
    title: "Actuator Status",
    value: "2 / 3 ON",
    icon: Fan,
    gradient: "from-violet-500/5",
    iconClass: "text-violet-400",
    badge: "Fan + Fogger",
    badgeClass: "text-violet-400 bg-violet-400/10",
    sub: "Auto threshold control",
  },
  {
    title: "Growth Cycle",
    value: "Day 42",
    icon: Sprout,
    gradient: "from-emerald-500/5",
    iconClass: "text-emerald-400",
    badge: "Fruiting Stage",
    badgeClass: "text-emerald-400 bg-emerald-400/10",
    sub: "Oyster Mushroom Batch #12",
  },
] as const;

export function MetricCards() {
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
