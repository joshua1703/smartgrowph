import Link from "next/link";
import { ArrowLeft, CheckCircle2, Shield, Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "Terms of Service — SmartGrow",
  description: "Terms of Service and conditions for using the SmartGrow Autonomous Greenhouse IoT Platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={32} className="size-8" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-foreground leading-none">
                SMARTGROW
              </span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-primary leading-none">
                Greenhouse IoT
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" className="h-8 rounded-lg px-3.5 text-xs font-bold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Legal Document Content ── */}
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        
        {/* Header Title */}
        <div className="space-y-3 border-b border-border/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Shield className="size-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: August 18, 2026 · Effective Immediately
          </p>
        </div>

        {/* Legal Body Sections */}
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using the SmartGrow platform, web application, API endpoints, or connected hardware services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must discontinue use of the platform immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              2. IoT Hardware & Closed-Loop Control
            </h2>
            <p>
              SmartGrow interfaces with ESP32 microcontrollers, DHT22 environmental sensors, ultrasonic foggers, and high-load exhaust relays. By using automated closed-loop triggers:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>You agree to operate hardware in compliance with local electrical safety regulations and commercial nursery guidelines.</li>
              <li>You acknowledge that automated triggers operate based on configured threshold setpoints and telemetry data packets.</li>
              <li>Failsafe timeout mechanisms are provided to prevent actuator overload, but manual safety inspections remain the operator&apos;s responsibility.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              3. User Accounts & Google Authentication
            </h2>
            <p>
              Access to greenhouse telemetry dashboards and relay controls is authenticated via Google OAuth (powered by Clerk). You are responsible for safeguarding your Google account credentials and maintaining authorized access to your connected sensor nodes.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              4. Telemetry Data & Ownership
            </h2>
            <p>
              All environmental telemetry readings, temperature logs, humidity records, and batch harvest analytics collected from your greenhouse nodes remain your property. SmartGrow processes this data to provide automated controls, anomaly detection, and cultivation insights.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              5. Limitation of Liability
            </h2>
            <p>
              While SmartGrow provides industrial-grade automation setpoints and 99.8% uptime failsafes, agricultural yield outcomes depend on various external factors (spawn quality, substrate pasteurization, grid outages). SmartGrow is provided &ldquo;as is&rdquo; without warranties of harvest volume guarantees.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              6. Contact & Support
            </h2>
            <p>
              If you have any questions regarding these Terms of Service, please contact our support team at{" "}
              <a href="mailto:support@smartgrow.io" className="font-semibold text-primary underline underline-offset-4">
                support@smartgrow.io
              </a>
              .
            </p>
          </section>

        </div>

        {/* Back Link Button */}
        <div className="mt-12 border-t border-border/80 pt-8 flex items-center justify-between">
          <Link href="/login">
            <Button variant="outline" className="gap-2 rounded-xl text-xs font-bold">
              <ArrowLeft className="size-3.5" />
              <span>Back to Sign In</span>
            </Button>
          </Link>
          <Link href="/privacy" className="text-xs font-semibold text-primary hover:underline">
            View Privacy Policy →
          </Link>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/80 py-6 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
          <p>© {new Date().getFullYear()} SmartGrow IoT Systems. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Theme</span>
            <ThemeToggle className="size-8" />
          </div>
        </div>
      </footer>

    </div>
  );
}
