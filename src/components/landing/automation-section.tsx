"use client";

import { useState } from "react";
import {
  Droplets,
  Fan,
  Sliders,
  Thermometer,
  ToggleRight,
  Wind,
  Workflow,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const equipmentList = [
  { label: "Exhaust Cooling Fan", relay: "Relay 1", icon: Fan },
  { label: "Ultrasonic Fogger", relay: "Relay 2", icon: Droplets },
  { label: "Irrigation Sprinkler", relay: "Relay 3", icon: Droplets },
  { label: "Fresh Air Damper", relay: "Relay 4", icon: Wind },
];

export function AutomationSection() {
  const [tempInput, setTempInput] = useState(28.8);
  const [humidityInput, setHumidityInput] = useState(76);

  const isFanActive = tempInput > 28.0;
  const isFoggerActive = humidityInput < 80;

  return (
    <section
      id="automation"
      aria-labelledby="automation-heading"
      className="border-y border-border/80 bg-muted/20 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Climate Automation"
          title="Let your greenhouse respond."
          description="Autonomous threshold rules trigger physical climate hardware the moment conditions drift out of range."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 items-stretch">
          
          {/* Left Column: Closed-Loop State Transitions Summary */}
          <Reveal delay={80} direction="none" className="h-full">
            <div className="flex flex-col justify-between h-full rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="size-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Closed-Loop State Transitions
                    </span>
                  </div>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                    Auto Recovery
                  </span>
                </div>

                {/* State Transition Flow Summary */}
                <div className="mt-5 space-y-3">
                  
                  {/* Temperature Loop */}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Thermometer className="size-3.5 text-primary" />
                        Temperature Recovery Loop
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">Setpoint: 28.0°C</span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px] font-medium">
                      <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-2 text-destructive">
                        <p className="text-[9px] uppercase font-bold">Trigger</p>
                        <p className="mt-0.5 font-bold tabular-nums text-foreground">&gt; 28.0°C</p>
                      </div>
                      <div className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary">
                        <p className="text-[9px] uppercase font-bold">Action</p>
                        <p className="mt-0.5 font-bold truncate">Fan Relay 1</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-2 text-muted-foreground">
                        <p className="text-[9px] uppercase font-bold">Target</p>
                        <p className="mt-0.5 font-bold text-foreground">26.5°C</p>
                      </div>
                    </div>
                  </div>

                  {/* Humidity Loop */}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Droplets className="size-3.5 text-teal-500" />
                        Humidity Stabilization Loop
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">Setpoint: 80% RH</span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px] font-medium">
                      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                        <p className="text-[9px] uppercase font-bold">Trigger</p>
                        <p className="mt-0.5 font-bold tabular-nums text-foreground">&lt; 80% RH</p>
                      </div>
                      <div className="rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary">
                        <p className="text-[9px] uppercase font-bold">Action</p>
                        <p className="mt-0.5 font-bold truncate">Fogger Relay 2</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-card p-2 text-muted-foreground">
                        <p className="text-[9px] uppercase font-bold">Target</p>
                        <p className="mt-0.5 font-bold text-foreground">90% RH</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Hardware Relays Summary Strip */}
              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Connected Actuators (4-Channel Isolated Relays)
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {equipmentList.map((e) => (
                    <div
                      key={e.label}
                      className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-2"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <e.icon className="size-3" strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-bold text-foreground">{e.label}</p>
                        <p className="text-[8px] font-mono text-muted-foreground">{e.relay}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </Reveal>

          {/* Right Column: Interactive Automation Simulator Summary */}
          <Reveal delay={140} direction="none" className="h-full">
            <div className="flex flex-col justify-between h-full rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
              
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="size-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Interactive Automation Simulator
                    </span>
                  </div>
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Live Test
                  </span>
                </div>

                {/* Simulation Controls */}
                <div className="mt-5 space-y-3.5">
                  
                  {/* Slider 1: Temperature */}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="size-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Temp Threshold (&gt; 28.0°C)</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                        {tempInput.toFixed(1)}°C
                      </span>
                    </div>

                    <input
                      type="range"
                      min="22.0"
                      max="32.0"
                      step="0.1"
                      value={tempInput}
                      onChange={(e) => setTempInput(parseFloat(e.target.value))}
                      className="mt-2.5 w-full accent-primary cursor-pointer h-1.5"
                      aria-label="Adjust temperature input"
                    />

                    <div className="mt-2.5 flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Fan
                          className={cn(
                            "size-3.5",
                            isFanActive ? "text-emerald-500 animate-spin" : "text-muted-foreground",
                          )}
                          style={{ animationDuration: isFanActive ? "1.5s" : "0s" }}
                        />
                        <span className="text-xs font-bold text-foreground">Relay 1 (Cooling Fan)</span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          isFanActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {isFanActive ? "ACTIVATED" : "STANDBY"}
                      </span>
                    </div>
                  </div>

                  {/* Slider 2: Humidity */}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Droplets className="size-3.5 text-teal-500" />
                        <span className="text-xs font-bold text-foreground">Humidity Threshold (&lt; 80% RH)</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                        {humidityInput}% RH
                      </span>
                    </div>

                    <input
                      type="range"
                      min="65"
                      max="98"
                      step="1"
                      value={humidityInput}
                      onChange={(e) => setHumidityInput(parseInt(e.target.value, 10))}
                      className="mt-2.5 w-full accent-teal-500 cursor-pointer h-1.5"
                      aria-label="Adjust humidity input"
                    />

                    <div className="mt-2.5 flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Droplets
                          className={cn(
                            "size-3.5",
                            isFoggerActive ? "text-teal-500 animate-pulse" : "text-muted-foreground",
                          )}
                        />
                        <span className="text-xs font-bold text-foreground">Relay 2 (Misting Fogger)</span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          isFoggerActive
                            ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {isFoggerActive ? "ACTIVATED" : "STANDBY"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Preset Buttons Strip */}
              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Presets:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-bold rounded-full"
                    onClick={() => {
                      setTempInput(29.4);
                      setHumidityInput(72);
                    }}
                  >
                    Midday Heat Spike
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-bold rounded-full"
                    onClick={() => {
                      setTempInput(25.5);
                      setHumidityInput(90);
                    }}
                  >
                    Optimal Climate
                  </Button>
                </div>
              </div>

            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
