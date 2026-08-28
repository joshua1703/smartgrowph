import { MetricCards } from "@/components/dashboard/metric-cards";
import { ServiceImpactChart } from "@/components/dashboard/service-impact-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PredictiveForecastBarChart } from "@/components/dashboard/predictive-forecast-bar-chart";
import { MayForecastPie } from "@/components/dashboard/may-forecast-pie";
import { ActuatorCapacityGauge } from "@/components/dashboard/capacity-gauge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex-1 space-y-3 p-6 pt-6 bg-background min-h-screen text-foreground">
      {/* ── Header ── */}
      <DashboardHeader />

      {/* ── Metric cards ── */}
      <MetricCards />

      {/* ── Real-time sensor chart + Activity feed ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Environmental Monitoring
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Real-time temperature, humidity, and fan activity from DHT22 sensor via ESP32 — today&apos;s 24-hour cycle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceImpactChart />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>

      {/* ── Weekly Sensor + Actuator Usage ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Weekly Sensor Averages
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Average temperature, humidity, and fan runtime per growing week from DHT22 readings stored in MySQL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PredictiveForecastBarChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Actuator Usage
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Runtime distribution of fan, fogger, and sprinkler — controlled automatically by the ESP32.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MayForecastPie />
          </CardContent>
        </Card>
      </div>

      {/* ── Actuator Runtime vs Capacity ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            Actuator Runtime vs. Capacity
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
            Daily runtime usage for each actuator against operational capacity — flags equipment nearing overuse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActuatorCapacityGauge />
        </CardContent>
      </Card>
    </div>
  );
}
