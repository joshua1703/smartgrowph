"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";

const platformLinks = [
  { label: "Overview", href: "#home" },
  { label: "Why SmartGrow", href: "#why-smartgrow" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Monitoring", href: "#monitoring" },
  { label: "Automation", href: "#automation" },
  { label: "Cultivation", href: "#cultivation" },
];

const systemLinks = [
  { label: "Dashboard Hub", href: "/dashboard" },
  { label: "IoT Control", href: "/dashboard/iot-control" },
  { label: "Sensor Readings", href: "/dashboard/sensor-readings" },
  { label: "Actuator Logs", href: "/dashboard/actuator-logs" },
  { label: "Growth Tracking", href: "/dashboard/growth-tracking" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/60">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo size={36} className="size-9" />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-foreground leading-none">
                  SMARTGROW
                </span>
                <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-primary leading-none">
                  Greenhouse Automation
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Smart greenhouse management and autonomous climate control engineered specifically for oyster mushroom cultivation with ESP32 controllers, DHT22 sensors, and isolated actuator relays.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational · ESP32 Telemetry Active</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <nav aria-label="Platform Links">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dashboard Shortcuts */}
          <nav aria-label="Dashboard Shortcuts">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Live Dashboard
            </p>
            <ul className="mt-4 space-y-2.5">
              {systemLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">© {new Date().getFullYear()} SmartGrow</span>
            <span>•</span>
            <span>Smart Greenhouse Management Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <ThemeToggle className="size-8" />
            <div className="flex items-center gap-4">
              <span>DHT22 Telemetry</span>
              <span>•</span>
              <span>MySQL Storage</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
