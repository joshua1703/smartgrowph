import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";

export function AuthTelemetryShowcase() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-zinc-950 p-6 sm:p-8 lg:p-10 text-white">
      {/* Subtle Background Radial Glow */}
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      {/* Top Brand Logo Link to Landing Page */}
      <div className="relative z-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          aria-label="Back to SmartGrow Home"
        >
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-white p-1 shadow-md shadow-emerald-950/50 transition-transform duration-200 group-hover:scale-105">
            <Image
              src={logoDark}
              alt="SmartGrow Logo"
              width={40}
              height={40}
              priority
              className="size-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white leading-none">
              SMARTGROW
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 leading-none">
              Greenhouse IoT
            </span>
          </div>
        </Link>
      </div>

      {/* Center Value Proposition & Feature List (Concise & Brief) */}
      <div className="relative z-10 my-auto py-4 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
          Autonomous IoT for commercial mushroom growers.
        </h2>

        <div className="space-y-4 pt-1">
          {/* Feature 1 */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-emerald-950">
              <Check className="size-3.5 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white leading-tight">
                Closed-Loop Automation
              </p>
              <p className="text-xs text-emerald-100/75 leading-relaxed">
                Automated exhaust fan and ultrasonic misting relays.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-emerald-950">
              <Check className="size-3.5 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white leading-tight">
                Live Sensor Telemetry
              </p>
              <p className="text-xs text-emerald-100/75 leading-relaxed">
                Real-time temperature, humidity, and CO₂ monitoring.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-emerald-950">
              <Check className="size-3.5 stroke-[3]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white leading-tight">
                Optimized Harvest Yields
              </p>
              <p className="text-xs text-emerald-100/75 leading-relaxed">
                Maintain optimal 85–92% RH to maximize crop flushes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
