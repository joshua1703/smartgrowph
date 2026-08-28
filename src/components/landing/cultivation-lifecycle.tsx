"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Database,
  Droplets,
  Layers,
  Leaf,
  PackageCheck,
  Sprout,
  Sun,
  Thermometer,
  Timer,
  Wind,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const stages = [
  {
    n: "01",
    name: "Inoculation",
    duration: "Day 0",
    description: "Grain spawn is introduced into pasteurized substrate bags under sterile conditions.",
    icon: Layers,
    temp: "24 – 26°C",
    humidity: "65 – 70%",
    co2: "Ambient",
    light: "Darkness",
    action: "Substrate prep & spawn introduction",
  },
  {
    n: "02",
    name: "Incubation",
    duration: "Days 1–14",
    description: "White mycelium colonizes the substrate matrix, generating internal metabolic heat.",
    icon: Timer,
    temp: "24 – 27°C",
    humidity: "75 – 80%",
    co2: "> 5,000 ppm",
    light: "0 Lux (Dark)",
    action: "ESP32 monitors bag core temperature",
  },
  {
    n: "03",
    name: "Pinning",
    duration: "Days 15–17",
    description: "Fresh air exchange and high humidity shock trigger miniature pinheads to form.",
    icon: Sprout,
    temp: "20 – 24°C",
    humidity: "90 – 95%",
    co2: "< 1,200 ppm",
    light: "800 – 1,000 Lux",
    action: "Foggers initiate high humidity cycle",
  },
  {
    n: "04",
    name: "Fruiting",
    duration: "Days 18–22",
    description: "Mushroom caps expand into dense clusters; rapid water and oxygen uptake occurs.",
    icon: Leaf,
    temp: "24 – 28°C",
    humidity: "85 – 92%",
    co2: "< 1,000 ppm",
    light: "1,000 Lux cycle",
    action: "Automated cooling & misting loop",
  },
  {
    n: "05",
    name: "Harvest",
    duration: "Days 23–25",
    description: "Clusters reach peak harvest weight before caps uncurl and drop spores.",
    icon: PackageCheck,
    temp: "22 – 25°C",
    humidity: "80 – 85%",
    co2: "< 1,000 ppm",
    light: "Ambient",
    action: "Batch yield logging in dashboard",
  },
  {
    n: "06",
    name: "Archived",
    duration: "Cycle Close",
    description: "Yields, flush counts, and energy usage are permanently archived in MySQL.",
    icon: Database,
    temp: "Logged",
    humidity: "Logged",
    co2: "Logged",
    light: "Archived",
    action: "Comparative historical analytics",
  },
];

export function CultivationLifecycle() {
  const [selectedStage, setSelectedStage] = useState(3); // Default to Fruiting

  const active = stages[selectedStage];

  return (
    <section
      id="cultivation"
      aria-labelledby="cultivation-heading"
      className="py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Cultivation Tracking"
          title="From inoculation to harvest."
          description="Track every oyster mushroom batch through its developmental lifecycle with automated climate target adaptation."
        />

        {/* Master-Detail 2-Column Summary Container */}
        <Reveal delay={100} direction="none" className="mt-12">
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs">
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[310px_1fr] lg:gap-7 items-stretch">
              
              {/* Left Column: 6 Stacked Stage Buttons */}
              <div className="flex flex-col gap-2">
                {stages.map((stage, i) => {
                  const isSelected = selectedStage === i;
                  return (
                    <button
                      key={stage.name}
                      type="button"
                      onClick={() => setSelectedStage(i)}
                      className={cn(
                        "group flex items-center justify-between rounded-2xl border p-2.5 text-left transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                          : "border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-xl font-bold transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          <stage.icon className="size-3.5" strokeWidth={2.2} />
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-[9px] font-mono font-bold uppercase tracking-wider",
                                isSelected ? "text-primary font-extrabold" : "text-muted-foreground",
                              )}
                            >
                              STAGE {stage.n}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-medium">
                              · {stage.duration}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground leading-tight">
                            {stage.name}
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "size-2 rounded-full transition-all shrink-0 mr-1",
                          isSelected ? "bg-primary scale-125" : "bg-transparent",
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Active Stage Summary & Substrate Photo Grid */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6 shadow-xs">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px] lg:gap-6 items-stretch">
                  
                  {/* Left Sub-Column: Text, Targets, Automation */}
                  <div className="flex flex-col justify-between h-full space-y-3.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                          Stage {active.n} · {active.name}
                        </span>
                        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                          Duration: {active.duration}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {active.description}
                      </p>

                      {/* 4-Stat Microclimate Target Grid in 2x2 */}
                      <div className="mt-3.5 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-border/70 bg-card p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Thermometer className="size-3 text-primary" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Target Temp</span>
                          </div>
                          <p className="mt-0.5 text-xs font-bold text-foreground tabular-nums">{active.temp}</p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-card p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Droplets className="size-3 text-teal-500" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Target RH</span>
                          </div>
                          <p className="mt-0.5 text-xs font-bold text-foreground tabular-nums">{active.humidity}</p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-card p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Wind className="size-3 text-primary" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Target CO₂</span>
                          </div>
                          <p className="mt-0.5 text-xs font-bold text-foreground tabular-nums">{active.co2}</p>
                        </div>

                        <div className="rounded-xl border border-border/70 bg-card p-2.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Sun className="size-3 text-amber-500" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Lighting</span>
                          </div>
                          <p className="mt-0.5 text-xs font-bold text-foreground tabular-nums">{active.light}</p>
                        </div>
                      </div>
                    </div>

                    {/* SmartGrow Automation Loop */}
                    <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs">
                      <span className="font-bold text-primary shrink-0 text-[11px]">Automation:</span>
                      <span className="text-muted-foreground text-[11px] truncate">{active.action}</span>
                    </div>
                  </div>

                  {/* Right Sub-Column: Natural Proportion Photo Container */}
                  <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[260px] w-full overflow-hidden rounded-2xl border border-border/80 shadow-xs group">
                    <Image
                      src="/images/oyster-substrate-macro.jpg"
                      alt="Pristine oyster mushroom cluster fruiting in greenhouse"
                      fill
                      className="object-cover object-center brightness-95 transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                        Pleurotus Ostreatus
                      </p>
                      <p className="text-xs font-bold leading-tight">
                        Pearl Oyster Substrate Fruiting
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </Reveal>

      </div>
    </section>
  );
}
