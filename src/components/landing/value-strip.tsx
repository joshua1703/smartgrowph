"use client";

import { Radio, Timer, Layers, RefreshCw } from "lucide-react";
import { Reveal } from "./reveal";

const pillars = [
  {
    value: "24/7",
    label: "Continuous Telemetry",
    desc: "Calibrated DHT22, CO₂, and substrate probes streaming live microclimate telemetry.",
    icon: Radio,
  },
  {
    value: "<100ms",
    label: "Relay Reaction Loop",
    desc: "Autonomous ESP32 firmware executes cooling fans and misting foggers in sub-second cycles.",
    icon: Timer,
  },
  {
    value: "4 Zones",
    label: "Independent Isolation",
    desc: "Dedicated environmental profiles for fruiting bays, pinning chambers, and incubation rooms.",
    icon: Layers,
  },
  {
    value: "6 Stages",
    label: "Full Batch Lifecycle",
    desc: "End-to-end tracking from initial inoculation and incubation through fruiting and harvest.",
    icon: RefreshCw,
  },
];

export function ValueStrip() {
  return (
    <section aria-label="Core platform pillars" className="border-y border-border/80 bg-muted/20 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        
        {/* Editorial Sub-Header & Narrative Statement */}
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/70">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                NATURE + EMBEDDED PRECISION
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[40px] leading-[1.12]">
                Built for the conditions mushrooms actually need.
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Oyster mushrooms (<em className="text-foreground">Pleurotus ostreatus</em>) demand strict climate balance. SmartGrow removes the guesswork with automated sensing and instant hardware response.
            </p>
          </div>
        </Reveal>

        {/* 4 High-Impact Metric Pillars */}
        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.label} delay={i * 60}>
              <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-primary tabular-nums">
                      {p.value}
                    </span>
                    <div className="flex size-8.5 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 shadow-xs">
                      <p.icon className="size-4" strokeWidth={2.2} />
                    </div>
                  </div>

                  <h3 className="mt-3.5 text-sm font-bold tracking-tight text-foreground">
                    {p.label}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
