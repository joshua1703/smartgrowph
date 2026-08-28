"use client";

import { useState } from "react";
import {
  Bell,
  Clock,
  Database,
  Fan,
  Filter,
  History,
  LineChart,
  Power,
  ShieldCheck,
  Sparkles,
  Sprout,
  Thermometer,
  Zap,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const traces = [
  {
    label: "Continuous Sensor Telemetry",
    desc: "Minute-by-minute records of temperature, humidity, CO₂, and substrate moisture.",
    icon: LineChart,
  },
  {
    label: "Automation Rule Trigger Logs",
    desc: "Exact trigger timestamps, sensor thresholds crossed, and relay actions taken.",
    icon: Zap,
  },
  {
    label: "Actuator Runtime & Energy",
    desc: "Cumulative operating hours for fans, foggers, and pumps to predict maintenance.",
    icon: Clock,
  },
  {
    label: "Batch Cultivation Milestones",
    desc: "Complete lifecycle timeline, inoculation dates, and final flush yield records.",
    icon: Sprout,
  },
];

const logRows = [
  {
    time: "14:32:05",
    zone: "Zone A",
    text: "Automation Rule 'Temp > 28°C' triggered",
    action: "Relay 1 (Cooling Fan) → ACTIVATED (1,450 RPM)",
    duration: "Active 8m",
    kind: "Automation",
    kindStyle: "bg-primary/10 text-primary border-primary/20",
  },
  {
    time: "14:28:40",
    zone: "Zone B",
    text: "Humidity reached 91% RH setpoint target",
    action: "Relay 2 (Ultrasonic Fogger) → STANDBY",
    duration: "Ran 14m",
    kind: "Relay",
    kindStyle: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  {
    time: "14:15:00",
    zone: "Zone C",
    text: "Incubation substrate probe telemetry sample",
    action: "DHT22 Node 03 · 29.1°C / 76% RH logged",
    duration: "Sample",
    kind: "Sensor",
    kindStyle: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    time: "13:58:12",
    zone: "Zone C",
    text: "High heat warning flagged in Incubation Bay",
    action: "Alert raised · Cooling loop engaged",
    duration: "Alert",
    kind: "Alert",
    kindStyle: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  {
    time: "13:30:00",
    zone: "Zone A",
    text: "Batch #M-204 Cultivation Milestone",
    action: "Advanced from Pinning → Fruiting Day 18",
    duration: "Milestone",
    kind: "Cultivation",
    kindStyle: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
];

export function AuditSection() {
  const [filter, setFilter] = useState("All");

  const filteredLogs =
    filter === "All" ? logRows : logRows.filter((r) => r.kind === filter);

  return (
    <section aria-labelledby="audit-heading" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left Column: Context & Trace Highlights */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Data & Auditing"
              title="Every action leaves a trace."
              description="SmartGrow records far more than current sensor numbers. Structured historical logs give growers the data needed to understand microclimate patterns, audit batch health, and continuously improve cultivation efficiency."
            />

            <Reveal delay={100}>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {traces.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <t.icon className="size-4" strokeWidth={2.2} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t.label}</h4>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {t.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <span>
                  All event records are safely indexed in structured relational tables in MySQL for reliable auditing and CSV/JSON export.
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Live Event Timeline Viewer */}
          <Reveal delay={140} direction="left">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl shadow-black/10">
              
              {/* Table Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 bg-muted/40 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    System Audit Stream
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["All", "Automation", "Relay", "Sensor", "Alert"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilter(cat)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all",
                        filter === cat
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Log Rows */}
              <div className="divide-y divide-border/60">
                {filteredLogs.map((row, idx) => (
                  <div
                    key={row.time + idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="shrink-0 text-[11px] font-mono font-bold text-muted-foreground mt-0.5">
                        {row.time}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-foreground">
                            {row.zone}
                          </span>
                          <p className="truncate text-xs font-bold text-foreground">
                            {row.text}
                          </p>
                        </div>
                        <p className="truncate text-[11px] font-mono text-muted-foreground mt-0.5">
                          {row.action}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {row.duration}
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                          row.kindStyle,
                        )}
                      >
                        {row.kind}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="border-t border-border/70 bg-muted/20 px-5 py-3 text-right">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Showing recent telemetry events • Full historical logs stored in MySQL
                </span>
              </div>

            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
