"use client";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageSquare, 
  Video, 
  FileText,
  Thermometer,
  Fan,
  Sprout,
  Cpu
} from "lucide-react";

export default function GetHelpPage() {
  return (
    <div className="flex-1 space-y-3 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="SUPPORT CENTER"
        title="Get Help & Documentation"
        subtitle="Learn how to navigate SmartGrow and get the most out of your IoT greenhouse monitoring system."
      />

      {/* Search Header */}
      <Card className="border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-none">
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search for guides, sensor setup, or troubleshooting..." 
              className="pl-10 h-12 bg-background/80 border-border/50 shadow-sm text-sm"
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-accent/50 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-accent">Sensor Setup</Badge>
            <Badge variant="secondary" className="bg-accent/50 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-accent">Actuator Control</Badge>
            <Badge variant="secondary" className="bg-accent/50 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-accent">Growth Tracking</Badge>
            <Badge variant="secondary" className="bg-accent/50 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-accent">ESP32 Config</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ESP32 & Sensor Setup */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Thermometer className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight">ESP32 & Sensor Setup</CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed">
              How the DHT22 sensors connect to the ESP32 microcontroller, and how temperature, humidity, CO₂, and soil moisture readings are collected across greenhouse zones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-[11px] font-bold uppercase tracking-widest text-primary hover:no-underline">
              Read Sensor Guide →
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-2">
              <Fan className="size-4 text-orange-500" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight">Actuator Automation</CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed">
              How fans, foggers, sprinklers, and LED grow lights are automatically triggered by the ESP32 based on real-time environmental thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-[11px] font-bold uppercase tracking-widest text-orange-500 hover:no-underline">
              View Automation Logic →
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
              <Sprout className="size-4 text-emerald-500" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight">Oyster Mushroom Growth Tracking</CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed">
              How to track cultivation batches through inoculation, incubation, primordia, fruiting, and harvest stages — including health scores and yield estimation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-[11px] font-bold uppercase tracking-widest text-emerald-500 hover:no-underline">
              Growth Guide →
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQs */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold tracking-tight">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is the ideal temperature and humidity range for oyster mushroom growing?</AccordionTrigger>
                <AccordionContent>
                  The optimal temperature range is 24–28°C and humidity should stay between 80–95% RH. The dashboard will display an &quot;Optimal&quot; or &quot;Ideal Range&quot; badge when readings fall within these thresholds.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does the ESP32 trigger actuators automatically?</AccordionTrigger>
                <AccordionContent>
                  The ESP32 reads sensor data every 2 hours. When temperature exceeds 28°C, the fan activates automatically. When humidity drops below 80%, the fogger turns on. You can also set scheduled triggers or activate actuators manually from the Actuator Logs page.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What do the growth stages (inoculation, incubation, fruiting) mean?</AccordionTrigger>
                <AccordionContent>
                  Each oyster mushroom batch goes through 6 lifecycle stages: Inoculation (spawning), Incubation (mycelium colonisation), Primordia (pinning), Fruiting (mushroom body development), Harvest (picking), and Completed. The Growth Tracking page shows the current stage, progress percentage, and estimated harvest date for each batch.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What does the &quot;Warning&quot; or &quot;Critical&quot; status mean on a sensor reading?</AccordionTrigger>
                <AccordionContent>
                  A &quot;Warning&quot; status means the reading is slightly outside the optimal range but not yet harmful. A &quot;Critical&quot; status indicates a dangerous threshold has been reached — such as temperature above 32°C or humidity below 60% — which may damage the oyster mushroom crop if not addressed immediately.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>How do I view sensor data for a specific greenhouse zone?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Sensor Readings page and use the zone filter dropdown (Zone A, B, C, or D) to view readings from a specific area. You can also filter by status (Normal, Warning, Critical) to quickly find problem areas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Support & Resources */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold tracking-tight">Still need help?</CardTitle>
              <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                Reach out for technical support with your SmartGrow system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 h-10">
                <MessageSquare className="size-4 text-primary" />
                <div className="text-left">
                  <p className="text-xs font-bold">Start a Support Ticket</p>
                  <p className="text-[10px] text-muted-foreground">Response time: &lt; 2 hours</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 h-10">
                <Video className="size-4 text-orange-500" />
                <div className="text-left">
                  <p className="text-xs font-bold">Watch Setup Tutorials</p>
                  <p className="text-[10px] text-muted-foreground">ESP32 wiring & sensor calibration guides</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50 h-10">
                <FileText className="size-4 text-emerald-500" />
                <div className="text-left">
                  <p className="text-xs font-bold">Download User Manual</p>
                  <p className="text-[10px] text-muted-foreground">Comprehensive PDF guide (v1.0)</p>
                </div>
              </Button>
            </CardContent>
          </Card>
          
          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Cpu className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-foreground">SmartGrow v1.0.0 — ESP32 Connected</p>
              <p className="text-[11px] text-muted-foreground">Your greenhouse monitoring system is running the latest firmware and dashboard build.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
