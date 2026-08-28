import { AuthTelemetryShowcase } from "@/components/auth/auth-telemetry-showcase";
import { GoogleSignInPanel } from "@/components/auth/google-sign-in-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Sign In — SmartGrow",
  description: "Sign in to your SmartGrow account to access greenhouse automation, live sensor telemetry, and batch cultivation analytics.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background relative selection:bg-emerald-500 selection:text-white">
      
      {/* Top Right Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-8 z-20">
        <ThemeToggle className="size-8" />
      </div>

      {/* Centered Split Unified Card */}
      <div className="w-full max-w-3xl lg:max-w-4xl rounded-[2rem] overflow-hidden border border-border/80 dark:border-white/10 shadow-2xl shadow-zinc-950/10 dark:shadow-emerald-950/20 grid grid-cols-1 md:grid-cols-2 bg-card">
        
        {/* Left Half (Dark Emerald Brand & Feature Showcase) */}
        <section aria-label="SmartGrow Overview" className="h-full">
          <AuthTelemetryShowcase />
        </section>

        {/* Right Half (Sign In Form) */}
        <section
          aria-label="Account Sign In Form"
          className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-card"
        >
          <GoogleSignInPanel />
        </section>

      </div>

    </main>
  );
}
