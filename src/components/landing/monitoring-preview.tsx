"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Gauge,
  Layers,
  Radio,
  Thermometer,
  Wind,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { AreaChart } from "./spark-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const metricTabs = [
  {
    id: "temp",
    label: "Temperature",
    value: "24.4",
    unit: "°C",
    icon: Thermometer,
    target: "24.0 – 28.0°C",
    status: "Optimal",
    delta: "+0.3°C vs 1h ago",
    data: [24.0, 24.2, 24.5, 24.3, 24.4, 24.6, 24.8, 24.7, 24.5, 24.4, 24.3, 24.4],
    avg: "24.4°C avg",
  },
  {
    id: "humidity",
    label: "Humidity",
    value: "88",
    unit: "% RH",
    icon: Droplets,
    target: "80 – 95% RH",
    status: "Optimal",
    delta: "Steady microclimate",
    data: [86, 85, 87, 88, 89, 90, 89, 88, 88, 87, 88, 88],
    avg: "88% avg",
  },
  {
    id: "co2",
    label: "CO₂ Level",
    value: "620",
    unit: "ppm",
    icon: Wind,
    target: "< 1000 ppm",
    status: "Safe",
    delta: "Damper loop normal",
    data: [720, 690, 660, 640, 630, 620, 615, 620, 625, 620, 618, 620],
    avg: "625 ppm avg",
  },
  {
    id: "moisture",
    label: "Substrate",
    value: "74",
    unit: "%",
    icon: Gauge,
    target: "70 – 80%",
    status: "Optimal",
    delta: "Moisture core stable",
    data: [75, 75, 74, 74, 74, 73, 74, 75, 74, 74, 74, 74],
    avg: "74% avg",
  },
];

const monitoredCapabilities = [
  { label: "Air Temperature & Humidity", icon: Thermometer },
  { label: "CO₂ Atmospheric Levels", icon: Wind },
  { label: "Substrate Core Moisture", icon: Gauge },
  { label: "Multi-Zone Live Alerts", icon: Layers },
];

const zoneStatuses = [
  { name: "Zone A", role: "Fruiting Bay 1", temp: "24.4°C", rh: "88%", status: "Optimal" },
  { name: "Zone B", role: "Fruiting Bay 2", temp: "25.2°C", rh: "90%", status: "Optimal" },
  { name: "Zone C", role: "Incubation Bay", temp: "27.8°C", rh: "82%", status: "Optimal" },
  { name: "Zone D", role: "Primordia Pinning", temp: "24.1°C", rh: "92%", status: "Optimal" },
];

export function MonitoringPreview() {
  const [selectedMetric, setSelectedMetric] = useState("temp");
  const currentMetric = metricTabs.find((m) => m.id === selectedMetric) || metricTabs[0];

  return (
    <section
      id="monitoring"
      aria-labelledby="monitoring-heading"
      className="py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          
          {/* Left Column: Explanatory Content */}
          <div className="flex flex-col items-start">
            <SectionHeading
              align="left"
              eyebrow="Real-Time Monitoring"
              title="Know what's happening inside your greenhouse."
              description="Continuous sensor telemetry and instant microclimate visibility across all cultivation bays."
            />

            {/* 4 Concise Capability Chips */}
            <Reveal delay={100} className="w-full">
              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {monitoredCapabilities.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card p-3 shadow-2xs transition-colors hover:border-primary/40"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <m.icon className="size-3.5" strokeWidth={2.2} />
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Action Buttons */}
            <Reveal delay={180}>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button className="h-10 px-5 text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20 rounded-full" asChild>
                  <Link href="/dashboard">
                    Open Live Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="h-10 px-5 text-xs font-bold uppercase tracking-wider hover:bg-accent rounded-full" asChild>
                  <Link href="/dashboard/sensor-readings">
                    View Sensor Logs
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Live Telemetry Hub Summary Window */}
          <Reveal delay={140} direction="none" className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 via-teal-500/10 to-transparent blur-2xl"
            />
            
            <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl shadow-black/10">
              
              {/* Telemetry Hub Header */}
              <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-3">
                <span className="text-xs font-bold text-foreground">
                  Live Telemetry Hub
                </span>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ESP32 Stream Active</span>
                </div>
              </div>

              {/* 4-Metric Summary Grid */}
              <div className="p-4 bg-muted/10 border-b border-border/70">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {metricTabs.map((m) => {
                    const isTabSelected = selectedMetric === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMetric(m.id)}
                        className={cn(
                          "flex flex-col items-start rounded-2xl border p-2.5 text-left transition-all cursor-pointer",
                          isTabSelected
                            ? "border-primary bg-background shadow-xs ring-1 ring-primary/20"
                            : "border-border/60 bg-card/60 hover:bg-card hover:border-border",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            {m.label}
                          </span>
                          <m.icon
                            className={cn(
                              "size-3",
                              isTabSelected ? "text-primary" : "text-muted-foreground",
                            )}
                            strokeWidth={2.2}
                          />
                        </div>
                        <p className="mt-1 text-sm font-black tabular-nums tracking-tight text-foreground">
                          {m.value}
                          <span className="text-[10px] font-medium text-muted-foreground ml-0.5">
                            {m.unit}
                          </span>
                        </p>
                        <span className="mt-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          {m.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Trendline Summary Area */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      24-Hour Cycle · {currentMetric.label}
                    </h4>
                    <p className="text-xs font-bold text-foreground">
                      Target: {currentMetric.target}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary font-mono">
                      {currentMetric.avg}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {currentMetric.delta}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-border/70 bg-muted/15 p-2.5">
                  <AreaChart
                    key={currentMetric.id}
                    gradientId={`preview-chart-${currentMetric.id}`}
                    values={currentMetric.data}
                    className="h-28 w-full"
                  />
                </div>

                {/* Multi-Zone Quick Strip */}
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Greenhouse Zone Status
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {zoneStatuses.map((z) => (
                      <div
                        key={z.name}
                        className="rounded-2xl border border-border/70 bg-card p-2 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-foreground">
                            {z.name}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="size-1 rounded-full bg-emerald-500" />
                            {z.status}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {z.role}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[9px] font-mono text-foreground font-semibold">
                          <span>{z.temp}</span>
                          <span>{z.rh}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
