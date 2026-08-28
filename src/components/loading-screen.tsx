"use client";

import { BrandLogo } from "@/components/brand-logo";

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export function LoadingScreen({
  title = "Connecting to SmartGrow...",
  subtitle = "Synchronizing greenhouse microclimate telemetry and controls.",
}: LoadingScreenProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* ── Atmospheric Radial Glows ── */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-500/15" />

      <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
        
        {/* ── Pulsing Brand Emblem with Sonar Waves ── */}
        <div className="relative flex size-20 items-center justify-center">
          {/* Outermost sonar wave */}
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping opacity-75" />
          {/* Inner ambient pulse */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 opacity-30 blur-md animate-pulse" />
          
          {/* Center Logo Badge */}
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 p-2 shadow-xl border border-emerald-500/30">
            <BrandLogo size={48} priority className="size-11" />
          </div>
        </div>

        {/* ── Typography & Dynamic Status ── */}
        <div className="space-y-2 max-w-sm">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* ── Fluid Progress Bar Shimmer ── */}
        <div className="relative h-1.5 w-48 overflow-hidden rounded-full bg-muted border border-border/60">
          <div className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-[shimmer_1.5s_infinite_ease-in-out]" />
        </div>

        {/* ── Hardware & Network Badge ── */}
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-[11px] font-mono text-muted-foreground shadow-xs backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ESP32 Telemetry Sync · 256-bit TLS</span>
        </div>

      </div>
    </div>
  );
}
