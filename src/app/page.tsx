import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ValueStrip } from "@/components/landing/value-strip";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { SystemFlow } from "@/components/landing/system-flow";
import { MonitoringPreview } from "@/components/landing/monitoring-preview";
import { AutomationSection } from "@/components/landing/automation-section";
import { CultivationLifecycle } from "@/components/landing/cultivation-lifecycle";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ValueStrip />
        <ProblemSolution />
        <SystemFlow />
        <MonitoringPreview />
        <AutomationSection />
        <CultivationLifecycle />
      </main>
      <Footer />
    </div>
  );
}
