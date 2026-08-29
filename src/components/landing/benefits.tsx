"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Gauge,
  Layers,
  Sprout,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const benefits = [
  {
    n: "01",
    title: "Reduce manual monitoring overhead",
    description: "Calibrated IoT probes monitor temperature, humidity, and CO₂ around the clock, eliminating manual walkthroughs with handheld tools.",
    icon: Eye,
    highlight: "Autonomous Sensing",
  },
  {
    n: "02",
    title: "Respond instantly to microclimate swings",
    description: "The ESP32 loop triggers cooling fans or ultrasonic foggers in sub-seconds, halting heat spikes and dry conditions before crop stress occurs.",
    icon: Cpu,
    highlight: "Sub-Second Action",
  },
  {
    n: "03",
    title: "Maintain optimal oyster microclimates",
    description: "Keep fruiting bays reliably within 24–28°C and 80–95% RH for dense pinhead development and prime cluster formation.",
    icon: Gauge,
    highlight: "Climate Stability",
  },
  {
    n: "04",
    title: "Monitor multiple zones independently",
    description: "Track separate fruiting chambers, incubation rooms, and pinning areas simultaneously with zero cross-zone blind spots.",
    icon: Layers,
    highlight: "Multi-Zone Isolation",
  },
  {
    n: "05",
    title: "Track cultivation progress per batch",
    description: "Follow batches from initial inoculation through fruiting flushes to harvest with automatic lifecycle milestones.",
    icon: Sprout,
    highlight: "Batch Tracking",
  },
  {
    n: "06",
    title: "Understand equipment runtime & energy",
    description: "Audit cumulative operating hours for cooling fans and foggers to plan proactive maintenance and monitor energy usage.",
    icon: BarChart3,
    highlight: "Operational Insight",
  },
];

export function Benefits() {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="border-y border-border/80 bg-muted/20 py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Practical Advantages"
          title="Less manual checking. More visibility."
          description="SmartGrow is built around the day-to-day realities of managing an oyster mushroom greenhouse — eliminating guesswork and protecting cultivation batches."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 70} className="h-full">
              <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                {/* Background Large Number Watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-4 text-7xl font-black tabular-nums tracking-tighter text-foreground/[0.03] transition-colors duration-300 group-hover:text-primary/[0.08]"
                >
                  {b.n}
                </span>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <b.icon className="size-5" strokeWidth={2.2} />
                    </span>
                    <span className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                      {b.highlight}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold tracking-tight text-foreground">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {b.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 border-t border-border/60 pt-3 text-[11px] font-bold text-primary">
                  <CheckCircle2 className="size-3.5" />
                  <span>Production Ready</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
