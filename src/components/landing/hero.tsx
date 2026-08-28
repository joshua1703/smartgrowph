"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  Leaf,
  Layers,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

const trustItems = [
  { label: "ESP32 Telemetry", icon: Cpu },
  { label: "DHT22 Sensors", icon: Gauge },
  { label: "Multi-Zone Relays", icon: Layers },
  { label: "Oyster Lifecycle", icon: Leaf },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pb-16 pt-24 sm:pb-24 sm:pt-32 lg:pt-36">
      {/* Background fine grid & atmospheric gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)] opacity-35"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[840px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/20 via-emerald-500/10 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          
          {/* Left Column: Hero Editorial Copy */}
          <div className="flex flex-col items-start">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-0.5 text-[10px] font-bold text-primary shadow-xs">
                <span className="flex size-1.5 rounded-full bg-primary animate-pulse" />
                <span className="tracking-widest uppercase">SMART GREENHOUSE AUTOMATION</span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[40px] leading-[1.12]">
                Smarter growing starts
                <br />
                with{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  better control
                </span>
                .
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-muted-foreground">
                Autonomous climate control, real-time sensor telemetry, and cultivation tracking engineered for oyster mushroom greenhouses.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button className="h-10 px-5 text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20 rounded-full" asChild>
                  <Link href="/dashboard">
                    Open Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-5 text-xs font-bold uppercase tracking-wider hover:bg-accent rounded-full"
                  asChild
                >
                  <Link href="#how-it-works">Explore the Platform</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2 border-t border-border/70 pt-5">
                {trustItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <item.icon className="size-3.5 text-primary shrink-0" strokeWidth={2.2} />
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Clean, High-Impact Visual Card */}
          <Reveal delay={200} direction="none" className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/25 via-emerald-500/15 to-transparent blur-2xl"
            />

            {/* Main Image Container */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl shadow-black/15 group">
              
              {/* High-Resolution Commercial Greenhouse Image */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:h-[440px] w-full overflow-hidden">
                <Image
                  src="/images/greenhouse-commercial-wide.jpg"
                  alt="Modern commercial oyster mushroom greenhouse with hanging substrate bags, atmospheric mist, and automated climate control"
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
                
                {/* Top Floating Status Badges */}
                <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-2 rounded-full border border-border/80 dark:border-white/20 bg-background/85 dark:bg-black/65 px-3.5 py-1.5 text-xs font-semibold text-foreground dark:text-white backdrop-blur-md shadow-md">
                    <span className="size-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span>Zone A · Fruiting Bay 1</span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-border/80 dark:border-white/20 bg-background/85 dark:bg-black/65 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 backdrop-blur-md shadow-md">
                    <Cpu className="size-3.5" />
                    <span>ESP32 Active</span>
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
