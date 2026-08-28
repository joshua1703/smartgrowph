"use client";

import Link from "next/link";
import Image from "next/image";
import { Cpu, Database, Layers, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal direction="none">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card px-6 py-14 text-center shadow-xl shadow-black/15 sm:px-12 sm:py-16">
            
            {/* Background High-Tech Greenhouse Editorial Image with Atmospheric Gradient Overlay */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <Image
                src="/images/greenhouse-commercial-wide.jpg"
                alt="SmartGrow automated greenhouse"
                fill
                className="object-cover object-center brightness-[0.22] contrast-[1.15]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background/80" />
            </div>

            <div className="mx-auto flex size-10 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-xs backdrop-blur-md border border-primary/30">
              <Sprout className="size-5" strokeWidth={2.2} />
            </div>

            <h2
              id="final-cta-heading"
              className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[40px] leading-[1.12]"
            >
              Grow with better visibility.
            </h2>
            
            <p className="mx-auto mt-3.5 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              Autonomous microclimate control, continuous sensor telemetry, and batch tracking unified into one connected greenhouse platform.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button className="h-10 px-5 text-xs font-bold uppercase tracking-wider shadow-md shadow-primary/20 rounded-full" asChild>
                <Link href="/dashboard">
                  Open Live Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 px-5 text-xs font-bold uppercase tracking-wider text-white border-white/20 bg-black/40 hover:bg-white/10 backdrop-blur-md rounded-full"
                asChild
              >
                <Link href="#how-it-works">Explore Architecture</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 border-t border-white/10 pt-5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="size-3.5 text-emerald-400" />
                ESP32 Telemetry
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Database className="size-3.5 text-emerald-400" />
                MySQL Relational Logs
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Layers className="size-3.5 text-emerald-400" />
                Multi-Zone Control
              </span>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
