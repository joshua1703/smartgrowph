"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Thermometer,
  Fan,
  Sprout,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Cpu,
  MoreVertical,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { UserProfileDialog } from "@/components/dashboard/user-profile-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href: string | null;
  section?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "IoT Control", icon: Cpu, href: "/dashboard/iot-control" },
  { label: "Sensor Readings", icon: Thermometer, href: "/dashboard/sensor-readings", section: "Monitoring" },
  { label: "Actuator Logs", icon: Fan, href: "/dashboard/actuator-logs" },
  { label: "Growth Tracking", icon: Sprout, href: "/dashboard/growth-tracking", section: "Cultivation" },
  { label: "Users", icon: Users, href: "/dashboard/users", section: "Administration" },
];

export function SidebarContent({ collapsed = false, onItemClick }: { collapsed?: boolean; onItemClick?: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* ── Brand ── */}
      <Link
        href="/"
        className={cn(
          "group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90 active:scale-[0.98]",
          collapsed ? "flex-col items-center px-0" : "px-2",
        )}
        aria-label="SmartGrow Home"
      >
        <BrandLogo
          size={collapsed ? 32 : 40}
          className={cn(
            "transition-all duration-200 group-hover:scale-105",
            collapsed ? "size-8" : "size-10"
          )}
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold tracking-tight text-foreground leading-none">
              SMARTGROW
            </p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary">
              Greenhouse Monitor
            </p>
          </div>
        )}
      </Link>

      {/* ── Nav section ── */}
      <div
        className={cn(
          "mt-8 min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
          collapsed ? "px-0" : "px-1",
        )}
      >
        {!collapsed && (
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Environment Control
          </p>
        )}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active =
              item.href != null &&
              (item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`));

            const sectionLabel =
              !collapsed && item.section ? (
                <p className="mt-5 mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.section}
                </p>
              ) : (
                collapsed && item.section ? <div className="my-2 h-px w-full bg-border/50" /> : null
              );

            const content = (
              <>
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-white" : "text-muted-foreground",
                  )}
                  strokeWidth={2}
                />
                {!collapsed && (
                  <span className="truncate text-[12px] font-semibold">
                    {item.label}
                  </span>
                )}
              </>
            );
            const itemClass = cn(
              "group flex items-center rounded-lg text-left transition-colors duration-150",
              collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            );

            const navElement =
              item.href == null ? (
                <span
                  key={item.label}
                  className={itemClass}
                  title={collapsed ? item.label : undefined}
                >
                  {content}
                </span>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={itemClass}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={onItemClick}
                >
                  {content}
                </Link>
              );

            return (
              <div key={item.label}>
                {sectionLabel}
                {navElement}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Secondary Links & User Card ── */}
      <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
        <div className="space-y-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center rounded-xl text-xs font-semibold transition-colors duration-150",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
              pathname === "/dashboard/settings"
                ? "bg-primary/15 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            title={collapsed ? "Settings" : undefined}
            onClick={onItemClick}
          >
            <Settings
              className={cn("size-4", pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground")}
              strokeWidth={2}
            />
            {!collapsed && <span>Settings</span>}
          </Link>
          <Link
            href="/dashboard/get-help"
            className={cn(
              "flex items-center rounded-xl text-xs font-semibold transition-colors duration-150",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
              pathname === "/dashboard/get-help"
                ? "bg-primary/15 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            title={collapsed ? "Get Help" : undefined}
            onClick={onItemClick}
          >
            <HelpCircle
              className={cn("size-4", pathname === "/dashboard/get-help" ? "text-primary" : "text-muted-foreground")}
              strokeWidth={2}
            />
            {!collapsed && <span>Get Help</span>}
          </Link>
        </div>

        {/* ── User card with 3-Dots Dropdown Popover ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group flex w-full items-center rounded-2xl bg-muted/40 p-2.5 border border-border/50 transition-all hover:bg-muted/70 hover:border-border cursor-pointer select-none text-left outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                collapsed ? "flex-col gap-2" : "gap-3",
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="size-8 shrink-0 border border-border">
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="size-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[9px] font-bold text-white">
                      {user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : "SG"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-sidebar bg-emerald-500 animate-pulse" />
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {user?.fullName || "IT Officer"}
                    </p>
                    <p className="truncate text-[10px] font-medium text-muted-foreground">
                      admin
                    </p>
                  </div>
                  <MoreVertical className="size-4 shrink-0 text-primary transition-colors" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-64 rounded-2xl border-border/80 bg-popover p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 z-50"
          >
            {/* Header with User Info */}
            <div className="flex items-center gap-3 p-2.5">
              <Avatar className="size-9 shrink-0 border border-border">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="size-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
                    {user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : "SG"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-xs font-bold text-foreground">
                  {user?.fullName || "IT Officer"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground font-mono">
                  {user?.primaryEmailAddress?.emailAddress || "dime.neil03@gmail.com"}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1 bg-border/80" />

            {/* Item 1: Account (Opens Edit Dialog) */}
            <DropdownMenuItem
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <UserCircle2 className="size-4 text-muted-foreground" />
              <span>Account</span>
            </DropdownMenuItem>

            {/* Item 2: Logout */}
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: "/login" })}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── User Profile & Account Dialog ── */}
        <UserProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      </div>
    </div>
  );
}

export function DashboardSidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "hidden lg:flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-6 transition-[width,padding] duration-200 ease-out",
        collapsed ? "w-[60px] px-1.5" : "w-[16%] min-w-[250px] px-5",
      )}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}
