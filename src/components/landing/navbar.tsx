"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Why SmartGrow", href: "#why-smartgrow" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Monitoring", href: "#monitoring" },
  { label: "Automation", href: "#automation" },
  { label: "Cultivation", href: "#cultivation" },
];

import { BrandLogo } from "@/components/brand-logo";

function Brand() {
  return (
    <Link
      href="#home"
      className="group flex items-center gap-2.5 transition-opacity hover:opacity-95 shrink-0"
      aria-label="SmartGrow home"
    >
      <BrandLogo size={36} priority className="size-8 sm:size-9 transition-transform group-hover:scale-105" />
      <div className="flex flex-col">
        <span className="text-[13px] sm:text-sm font-extrabold tracking-tight text-foreground leading-none">
          SMARTGROW
        </span>
        <span className="mt-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-primary leading-none">
          Greenhouse IoT
        </span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = [
        "home",
        "why-smartgrow",
        "how-it-works",
        "monitoring",
        "automation",
        "cultivation",
      ];
      const scrollPosition = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }
      setActiveSection("home");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-5 sm:px-8 pt-3 sm:pt-4 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto w-full max-w-7xl">
        <nav
          className={cn(
            "flex items-center justify-between px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl md:rounded-full border transition-all duration-300",
            scrolled
              ? "border-border/90 bg-background/90 dark:bg-card/90 shadow-xl shadow-black/5 dark:shadow-black/30 backdrop-blur-xl"
              : "border-border/60 bg-background/75 dark:bg-card/75 shadow-lg shadow-black/[0.03] dark:shadow-black/20 backdrop-blur-lg",
          )}
          aria-label="Primary navigation"
        >
          <Brand />

          {/* Desktop Nav Links (>= 1024px) */}
          <div className="hidden items-center gap-1 lg:flex rounded-full bg-muted/50 dark:bg-muted/30 p-1 border border-border/50">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200",
                    isActive
                      ? "bg-background text-emerald-700 dark:text-emerald-300 dark:bg-accent shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-accent/40",
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Action Buttons & Menu Trigger */}
          <div className="flex items-center gap-2">
            {/* Desktop Action Button (>= 1024px) */}
            <div className="hidden items-center lg:flex">
              <Button
                size="sm"
                className="text-xs font-semibold shadow-xs shadow-primary/20 rounded-full px-4 py-1.5"
                asChild
              >
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            </div>

            {/* Mobile / Tablet Menu & Quick Action (< 1024px) */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <Button
                size="sm"
                className="h-8 rounded-full px-3 text-[11px] font-semibold shadow-xs shadow-primary/20"
                asChild
              >
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="size-8.5 rounded-xl text-foreground hover:bg-accent"
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile / Tablet Drawer (Floating card below navbar) */}
        {open && (
          <div className="mt-2 rounded-2xl border border-border bg-background/95 dark:bg-card/95 backdrop-blur-2xl p-4 shadow-2xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    activeSection === link.href.replace("#", "")
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
