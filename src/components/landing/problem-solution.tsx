"use client";

import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const comparisons = [
  {
    category: "Microclimate Telemetry",
    manual: {
      title: "Intermittent Spot Checks",
      desc: "Handheld tools miss critical temperature and humidity spikes between manual rounds.",
    },
    automated: {
      title: "24/7 Continuous Telemetry",
      desc: "Calibrated DHT22, CO₂, and substrate probes stream microclimate readings uninterrupted.",
    },
  },
  {
    category: "Hardware Execution",
    manual: {
      title: "Delayed Manual Toggles",
      desc: "Fans and foggers must be turned on by hand after conditions have already drifted.",
    },
    automated: {
      title: "Instant Sub-Second Action",
      desc: "ESP32 microcontrollers engage cooling fans and ultrasonic foggers the moment thresholds cross.",
    },
  },
  {
    category: "Zone Coverage",
    manual: {
      title: "Multi-Zone Blind Spots",
      desc: "Single door readings mask hot or dry microclimates across distant substrate rows.",
    },
    automated: {
      title: "Dedicated Zone Profiles",
      desc: "Customized setpoints isolated for fruiting bays, pinning chambers, and incubation rooms.",
    },
  },
  {
    category: "Diagnosis & History",
    manual: {
      title: "No Data Trail for Diagnosis",
      desc: "Stalled mycelial growth or aborted pinheads lack telemetry logs to diagnose the cause.",
    },
    automated: {
      title: "Full Relational Audit Logs",
      desc: "Every environmental reading, rule trigger, and batch timeline is logged into MySQL.",
    },
  },
];

export function ProblemSolution() {
  return (
    <section id="why-smartgrow" aria-labelledby="problem-solution-heading" className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Why SmartGrow"
          title="Less guesswork. More control."
          description="Oyster mushroom cultivation requires strict climate stability. Here is how SmartGrow replaces manual routines with autonomous precision."
        />

        {/* Master Comparison Container */}
        <Reveal delay={100} direction="none" className="mt-12">
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
            
            {/* Header Columns */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 border-b border-border/70 pb-5">
              
              {/* Left Column Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                  Traditional Manual Routine
                </span>
                <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-destructive">
                  High Risk &amp; Labor
                </span>
              </div>

              {/* Right Column Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  SmartGrow Autonomous System
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                  Continuous IoT Precision
                </span>
              </div>

            </div>

            {/* Direct Side-by-Side Comparison Rows */}
            <div className="mt-5 space-y-3">
              {comparisons.map((row) => (
                <div
                  key={row.category}
                  className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6"
                >
                  {/* Manual Feature Card */}
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/[0.02] dark:bg-destructive/[0.04] p-4 transition-colors">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-[11px] font-bold">
                      ✕
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{row.manual.title}</h3>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {row.manual.desc}
                      </p>
                    </div>
                  </div>

                  {/* Automated Feature Card */}
                  <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.02] dark:bg-primary/[0.04] p-4 transition-colors hover:border-primary/45 shadow-2xs">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                      ✓
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{row.automated.title}</h3>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {row.automated.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Outcome Summary Strip */}
            <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6 border-t border-border/70 pt-4">
              <div className="rounded-2xl border border-dashed border-destructive/30 bg-destructive/[0.04] p-3 text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  Outcome: <span className="font-bold text-foreground">Constant manual checking, crop stress &amp; yield loss.</span>
                </p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-center">
                <p className="text-xs text-primary font-medium">
                  Outcome: <span className="font-bold text-foreground">Autonomous climate stability &amp; maximum batch yield.</span>
                </p>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
