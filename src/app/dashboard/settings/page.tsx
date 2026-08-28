"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Building2, Bell, Shield, Laptop, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "account" | "greenhouse" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  return (
    <div className="flex-1 space-y-3 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="SYSTEM MANAGEMENT"
        title="Settings"
        subtitle="Manage your system preferences and greenhouse configuration for SmartGrow."
      />

      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-1">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("account")}
            className={cn(
              "justify-start gap-3 h-9 px-3 transition-all",
              activeTab === "account" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <User className="size-4" />
            <span className="text-[12px] font-semibold">Account</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("greenhouse")}
            className={cn(
              "justify-start gap-3 h-9 px-3 transition-all",
              activeTab === "greenhouse" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Building2 className="size-4" />
            <span className="text-[12px] font-semibold">Greenhouse</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "justify-start gap-3 h-9 px-3 transition-all",
              activeTab === "notifications" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Bell className="size-4" />
            <span className="text-[12px] font-semibold">Notifications</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("security")}
            className={cn(
              "justify-start gap-3 h-9 px-3 transition-all",
              activeTab === "security" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Shield className="size-4" />
            <span className="text-[12px] font-semibold">Security</span>
          </Button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 lg:col-span-5">
          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight">Account Profile</CardTitle>
                      <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                        Update your personal information and system role.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-widest font-bold">
                      Active Session
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <Input defaultValue="Koji Kiyotaka" className="bg-background/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <Input defaultValue="koji.kiyotaka@cdo.gov.ph" className="bg-background/50 border-border/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">System Role</label>
                    <div className="flex items-center gap-2">
                      <Input defaultValue="Greenhouse Operator" disabled className="bg-muted/50 border-border/50 cursor-not-allowed" />
                      <Badge className="bg-zinc-900 text-white text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap h-9 px-4 rounded-md">Operator Access</Badge>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Preferences</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    Dashboard and UI behavior settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Compact View</p>
                      <p className="text-[11px] text-muted-foreground">Reduce padding and font sizes for high-density information display.</p>
                    </div>
                    <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-[10px] uppercase font-bold px-2 py-0">Off</Badge>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Automated Actuator Controls</p>
                      <p className="text-[11px] text-muted-foreground">Use DHT22 sensor readings to dynamically trigger greenhouse ventilation and watering.</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "greenhouse" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Greenhouse Configuration</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    Setup details for the SmartGrow cultivation greenhouse.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Greenhouse Facility Name</label>
                    <Input defaultValue="SmartGrow Cultivation Room A" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Facility Location</label>
                    <Input defaultValue="Greenhouse Zone 1, Sector B" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">ESP32 Controller IP</label>
                      <Input defaultValue="192.168.1.150" className="bg-background/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Default Growing Stage</label>
                      <Input defaultValue="Fruiting Stage" className="bg-background/50 border-border/50" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6">
                      Update Greenhouse Info
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Greenhouse Actuators</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    Define operational capacity limits for hardware actuators.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Actuator</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Description</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest">Daily Capacity (Hours)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold">Fan (Cooling)</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">Controls temperature and air circulation.</TableCell>
                        <TableCell className="text-xs font-medium">48h (Dual fans)</TableCell>
                      </TableRow>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold">Fogger (Humidity)</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">Controls relative humidity in greenhouse.</TableCell>
                        <TableCell className="text-xs font-medium">40h</TableCell>
                      </TableRow>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold">Sprinkler (Watering)</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">Watering system for growth bags.</TableCell>
                        <TableCell className="text-xs font-medium">24h</TableCell>
                      </TableRow>
                      <TableRow className="border-border/50">
                        <TableCell className="text-xs font-bold">Exhaust Vent (CO₂)</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">Exchanges fresh air when CO₂ levels rise.</TableCell>
                        <TableCell className="text-xs font-medium">30h</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Alert Preferences</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    Choose which system events trigger operator notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Low Water Reservoir</p>
                      <p className="text-[11px] text-muted-foreground">Notify when the sprinkler water reservoir level falls below 15% capacity.</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0">Always</Badge>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Critical Climate Alert</p>
                      <p className="text-[11px] text-muted-foreground">Alert when temperature exceeds 30°C or humidity drops below 70% RH.</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0">Always</Badge>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">ESP32 Offline Alert</p>
                      <p className="text-[11px] text-muted-foreground">Notify immediately if the ESP32 microcontroller loses connection for more than 5 minutes.</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold px-2 py-0">Immediate</Badge>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">Weekly Yield Report</p>
                      <p className="text-[11px] text-muted-foreground">Receive a yield and batch health summary report every Monday morning.</p>
                    </div>
                    <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 text-[10px] uppercase font-bold px-2 py-0">Disabled</Badge>
                  </div>
                  <div className="pt-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6">
                      Save Alert Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Security Credentials</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    Manage your password and authentication methods.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                    <Input type="password" placeholder="••••••••" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                      <Input type="password" placeholder="••••••••" className="bg-background/50 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                      <Input type="password" placeholder="••••••••" className="bg-background/50 border-border/50" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6">
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    Add an extra layer of security to your operator account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Smartphone className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Authenticator App</p>
                      <p className="text-[11px] text-muted-foreground">Verify your identity using a mobile app (Google Authenticator, etc).</p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-xs font-bold px-6 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">
                    Setup 2FA
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold tracking-tight">Active Sessions</CardTitle>
                  <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
                    View and manage your current system sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Laptop className="size-4 text-primary" />
                        <div>
                          <div className="text-xs font-bold text-foreground flex items-center">Control Center Workstation <Badge className="ml-2 text-[8px] bg-emerald-500 h-3 px-1">Current</Badge></div>
                          <p className="text-[10px] text-muted-foreground">Chrome • SmartGrow Local Network • 192.168.1.10</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Online</span>
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-3">
                        <Smartphone className="size-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs font-bold text-foreground">Operator Phone</div>
                          <p className="text-[10px] text-muted-foreground">Safari • Mobile Network • 112.198.xxx.xxx</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="h-7 text-[10px] font-bold text-primary">Revoke</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
