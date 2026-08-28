import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "Privacy Policy — SmartGrow",
  description: "Privacy Policy detailing how SmartGrow handles IoT sensor data, user authentication, and greenhouse telemetry.",
};

export default function PrivacyPage() {
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

      {/* ── Main Privacy Document Content ── */}
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        
        {/* Header Title */}
        <div className="space-y-3 border-b border-border/80 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: August 18, 2026 · Committed to Agronomy Data Integrity
          </p>
        </div>

        {/* Legal Body Sections */}
        <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Lock className="size-5 text-emerald-500" />
              1. Information We Collect
            </h2>
            <p>
              SmartGrow collects the following categories of information to provide automated microclimate control:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li><strong>Account Information:</strong> Profile details (name, email address, profile picture) provided through Google Single Sign-On (Clerk authentication).</li>
              <li><strong>Sensor & Environmental Telemetry:</strong> Real-time temperature readings, relative humidity levels, CO₂ concentrations, timestamp ticks, and zone identifications transmitted from your ESP32 hardware nodes.</li>
              <li><strong>Actuator Logs:</strong> Closed-loop relay state records, fan PWM speeds, fogger duty cycles, and manual toggle events.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is used exclusively for operational and agricultural automation purposes:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>Executing closed-loop relay automation based on your configured microclimate setpoints.</li>
              <li>Rendering live charts, historical trend curves, and crop batch lifecycle progression.</li>
              <li>Triggering critical anomaly alerts when sensor parameters breach safe cultivating thresholds.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              3. Data Security & Storage
            </h2>
            <p>
              We implement industry-standard security measures including 256-bit TLS/SSL encryption for all data in transit between ESP32 microcontrollers, edge relays, and our cloud infrastructure. Authentication sessions are managed using encrypted JWT tokens.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              4. Third-Party Services
            </h2>
            <p>
              SmartGrow integrates with Clerk for secure Google OAuth identity management. We never sell, lease, or monetize your greenhouse telemetry or business cultivation logs to third-party advertisers.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              5. Your Rights & Data Portability
            </h2>
            <p>
              You have the right to request access to, export, or delete your account records and historical sensor logs at any time via your dashboard settings or by contacting our data privacy office.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-foreground">
              6. Privacy Inquiries
            </h2>
            <p>
              For any questions regarding this Privacy Policy or your greenhouse data, reach us at{" "}
              <a href="mailto:privacy@smartgrow.io" className="font-semibold text-primary underline underline-offset-4">
                privacy@smartgrow.io
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
          <Link href="/terms" className="text-xs font-semibold text-primary hover:underline">
            View Terms of Service →
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
