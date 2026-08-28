"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplets,
  Fan,
  Layers,
  MapPin,
  Sparkles,
  SprayCan,
  Thermometer,
  Wind,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const zones = [
  {
    id: "zone-a",
    name: "Zone A",
    title: "Fruiting Bay 1",
    status: "Optimal",
    attention: false,
    temp: "26.4°C",
    humidity: "88% RH",
    co2: "620 ppm",
    stage: "Fruiting Phase",
    batch: "Batch #M-204 (Pearl Oyster)",
    fan: true,
    fogger: false,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
  {
    id: "zone-b",
    name: "Zone B",
    title: "Fruiting Bay 2",
    status: "Optimal",
    attention: false,
    temp: "25.8°C",
    humidity: "91% RH",
    co2: "590 ppm",
    stage: "Fruiting Phase",
    batch: "Batch #M-205 (Blue Oyster)",
    fan: false,
    fogger: true,
    gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
  },
  {
    id: "zone-c",
    name: "Zone C",
    title: "Incubation Chamber",
    status: "Active Correction",
    attention: true,
    temp: "29.1°C",
    humidity: "76% RH",
    co2: "1,150 ppm",
    stage: "Incubation Phase",
    batch: "Batch #M-208 (King Oyster)",
    fan: true,
    fogger: false,
    alertText: "Temp threshold > 28°C exceeded. Relay 1 cooling fan running.",
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    id: "zone-d",
    name: "Zone D",
    title: "Primordia Pinning",
    status: "Optimal",
    attention: false,
    temp: "24.5°C",
    humidity: "93% RH",
    co2: "710 ppm",
    stage: "Primordia Pinning",
    batch: "Batch #M-209 (Golden Oyster)",
    fan: false,
    fogger: true,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
];

export function ZoneMonitoring() {
  const [activeZoneId, setActiveZoneId] = useState("zone-a");
  const selectedZone = zones.find((z) => z.id === activeZoneId) || zones[0];

  return (
    <section
      id="zones"
      aria-labelledby="zones-heading"
      className="border-y border-border/80 bg-muted/20 py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          
          {/* Left Column: Context & Selected Zone Inspector */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Multi-Zone Greenhouse"
              title="Every zone. One connected view."
              description="Every greenhouse bay is monitored independently. An environmental spike in an isolated corner will never hide behind an average reading from the rest of the facility."
            />

            <Reveal delay={100}>
              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Layers className="size-4" strokeWidth={2.2} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Independent Node Isolation</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Zones A, B, C, and D report their own DHT22 telemetry, fan statuses, and relay triggers without cross-contamination.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="size-4" strokeWidth={2.2} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Zone-Specific Automation Profiles</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Configure high humidity (90%+) in fruiting bays while keeping incubation rooms at warmer 26°C with lower light.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Selected Zone Live Inspector */}
            <Reveal delay={160}>
              <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
                <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                      {selectedZone.name}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {selectedZone.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      selectedZone.attention
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        selectedZone.attention ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
                      )}
                    />
                    {selectedZone.status}
                  </span>
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-border/60 bg-background/80 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Temp</p>
                    <p className="mt-0.5 text-sm font-black tabular-nums text-foreground">{selectedZone.temp}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/80 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Humidity</p>
                    <p className="mt-0.5 text-sm font-black tabular-nums text-foreground">{selectedZone.humidity}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/80 p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">CO₂</p>
                    <p className="mt-0.5 text-sm font-black tabular-nums text-foreground">{selectedZone.co2}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                  <span>Current Batch: <strong className="text-foreground">{selectedZone.batch}</strong></span>
                  <span className="text-[11px] font-semibold text-primary">{selectedZone.stage}</span>
                </div>

                {selectedZone.attention && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-500">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>{selectedZone.alertText}</span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Interactive Spatial Greenhouse Top-Down Blueprint */}
          <Reveal delay={140} direction="left">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl shadow-black/10 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Greenhouse Floor Architecture
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  4 Telemetry Nodes Online
                </span>
              </div>

              {/* 2x2 Spatial Top-Down Interactive Blueprint */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {zones.map((z) => {
                  const isCurrent = activeZoneId === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setActiveZoneId(z.id)}
                      className={cn(
                        "group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-300 min-h-[145px] overflow-hidden",
                        isCurrent
                          ? z.attention
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-[1.02]"
                            : "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]"
                          : z.attention
                            ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10"
                            : "border-border/70 bg-muted/20 hover:border-primary/40 hover:bg-card",
                      )}
                    >
                      {/* Atmospheric Ambient Gradient */}
                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50",
                          z.gradient,
                        )}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black tracking-tight text-foreground">
                            {z.name}
                          </span>
                          <span
                            className={cn(
                              "flex size-2 rounded-full",
                              z.attention ? "bg-amber-500 animate-pulse" : "bg-emerald-500",
                            )}
                          />
                        </div>
                        <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                          {z.title}
                        </p>
                      </div>

                      {/* Equipment State Badges */}
                      <div className="relative z-10 my-2 flex items-center gap-2">
                        {z.fan && (
                          <span className="flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-500 border border-emerald-500/30">
                            <Fan className="size-2.5 animate-spin" style={{ animationDuration: "2s" }} />
                            Fan Active
                          </span>
                        )}
                        {z.fogger && (
                          <span className="flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[9px] font-bold text-teal-400 border border-teal-500/30">
                            <SprayCan className="size-2.5 animate-pulse" />
                            Fogger Active
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] font-mono">
                        <span className="font-bold text-foreground">{z.temp}</span>
                        <span className="font-semibold text-muted-foreground">{z.humidity}</span>
                      </div>

                      {/* Selected Node Check Indicator */}
                      {isCurrent && (
                        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Blueprint Footer / Legend */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Optimal Zone
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <span className="size-2 rounded-full bg-amber-500" />
                    Active Correction
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Click any zone node to inspect
                </span>
              </div>

            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
