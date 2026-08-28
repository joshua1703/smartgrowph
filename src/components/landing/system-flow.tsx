"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Database,
  MonitorSmartphone,
  Radio,
  ToggleRight,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const pipelineStages = [
  {
    id: "sensors",
    number: "01",
    label: "IoT Sensing",
    subtitle: "Calibrated Hardware",
    icon: Radio,
    badge: "Input",
    specs: "DHT22 (±0.5°C) · CO₂ Probe · Substrate Moisture",
    summary: "Calibrated sensor probes continuously stream live air temperature, relative humidity, atmospheric CO₂, and substrate moisture.",
    liveMetrics: [
      { label: "Temperature", val: "24.2°C" },
      { label: "Humidity", val: "88% RH" },
      { label: "CO₂ Level", val: "620 ppm" },
      { label: "Moisture", val: "74%" },
    ],
  },
  {
    id: "esp32",
    number: "02",
    label: "ESP32 Edge Loop",
    subtitle: "Local Microcontroller",
    icon: Cpu,
    badge: "Edge Logic",
    specs: "Sub-100ms Async Loop · Zero Internet Latency",
    summary: "Onboard firmware evaluates environmental threshold rules locally every second, deciding when to trigger equipment without cloud delay.",
    liveMetrics: [
      { label: "Cycle Rate", val: "1.0s" },
      { label: "Rule Evaluation", val: "Instant" },
      { label: "Hysteresis", val: "Active" },
      { label: "Bus Latency", val: "<100ms" },
    ],
  },
  {
    id: "actuators",
    number: "03",
    label: "Actuator Relays",
    subtitle: "Physical Automation",
    icon: ToggleRight,
    badge: "Hardware",
    specs: "4-Channel Isolated Relays · Auto/Manual",
    summary: "Opto-isolated relays switch cooling exhaust fans, ultrasonic misting foggers, fresh-air dampers, and substrate irrigation.",
    liveMetrics: [
      { label: "Exhaust Fan", val: "Active" },
      { label: "Misting Fogger", val: "Standby" },
      { label: "Air Damper", val: "Open" },
      { label: "Irrigation", val: "Standby" },
    ],
  },
  {
    id: "storage",
    number: "04",
    label: "MySQL Storage",
    subtitle: "Audit & Telemetry",
    icon: Database,
    badge: "Database",
    specs: "Indexed Time-Series · Batch Milestones",
    summary: "Every sensor reading, actuator runtime hour, and yield milestone is safely indexed and stored for auditing and analytics.",
    liveMetrics: [
      { label: "Storage Engine", val: "MySQL" },
      { label: "Logging Rate", val: "Real-Time" },
      { label: "Audit Trail", val: "Encrypted" },
      { label: "Batch Index", val: "Active" },
    ],
  },
  {
    id: "dashboard",
    number: "05",
    label: "Web Platform",
    subtitle: "Grower Interface",
    icon: MonitorSmartphone,
    badge: "Interface",
    specs: "Next.js 15 · Real-Time Telemetry · Multi-Zone",
    summary: "Growers view live conditions, adjust environmental setpoints, track batch stages, and receive instant alerts from any device.",
    liveMetrics: [
      { label: "Live Dashboard", val: "Connected" },
      { label: "Multi-Zone", val: "4 Zones" },
      { label: "Alert Engine", val: "Active" },
      { label: "Web Access", val: "Any Browser" },
    ],
  },
];

export function SystemFlow() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % pipelineStages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = pipelineStages[activeStage];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-y border-border/80 bg-muted/20 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="System Architecture"
          title="From sensor probe to automated response."
          description="An autonomous closed loop connecting environmental sensors, edge logic, actuators, and cloud analytics in real time."
        />

        {/* Interactive Architecture 2-Column Master-Detail Layout */}
        <Reveal delay={100} direction="none" className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
            
            {/* Header / Signal Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <Workflow className="size-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  System Pipeline Flow
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ESP32 Telemetry Loop Active (~100ms)</span>
              </div>
            </div>

            {/* Side-by-Side Grid: Left Cards, Right Description */}
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[330px_1fr] lg:gap-6 items-stretch">
              
              {/* Left Column: 5 Stacked Interactive Stage Cards */}
              <div className="flex flex-col gap-2.5">
                {pipelineStages.map((stage, idx) => {
                  const isSelected = activeStage === idx;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActiveStage(idx)}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                          : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl font-bold transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          <stage.icon className="size-4" strokeWidth={2.2} />
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-[10px] font-mono font-bold uppercase tracking-wider",
                                isSelected ? "text-primary font-extrabold" : "text-muted-foreground",
                              )}
                            >
                              STAGE {stage.number}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground leading-tight">
                            {stage.label}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {stage.subtitle}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "size-2 rounded-full transition-all shrink-0 mr-1",
                          isSelected ? "bg-primary scale-125" : "bg-transparent",
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Stage Description & Live Telemetry Details */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-7 shadow-xs">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                      Stage {current.number} · {current.label}
                    </span>
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {current.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-extrabold text-foreground sm:text-lg">
                    {current.label} &mdash; {current.subtitle}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {current.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">Hardware Specs:</span>
                    <span className="rounded-lg border border-border/70 bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                      {current.specs}
                    </span>
                  </div>
                </div>

                {/* Live Stage Status / Metrics Matrix */}
                <div className="mt-6 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Radio className="size-3.5 text-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Live Status
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">ESP32 &bull; Zone A</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {current.liveMetrics.map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col rounded-xl border border-border/60 bg-muted/20 p-2.5 text-left"
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="mt-0.5 text-xs font-bold text-foreground tabular-nums">
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
