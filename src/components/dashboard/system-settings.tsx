"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Sliders, Save, Loader2, Bot } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUserRole } from "@/lib/use-user-role";
import { logSystemActivity } from "@/lib/audit-logger";

export function SystemSettings() {
  const queryClient = useQueryClient();
  const { canControlDevices, role } = useUserRole();

  const [interval, setIntervalState] = useState("5000");
  const [autoMode, setAutoMode] = useState(true);
  const [tempTarget, setTempTarget] = useState("26.0");
  const [humidityTarget, setHumidityTarget] = useState("85.0");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch system settings from Supabase
  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return null;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("system_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      return data;
    },
  });

  // Sync state with database row and localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInterval = localStorage.getItem("smartgrow_polling_interval");
      if (savedInterval) setIntervalState(savedInterval);
    }

    if (dbSettings) {
      setAutoMode(dbSettings.auto_mode ?? true);
      if (dbSettings.temp_target) setTempTarget(String(dbSettings.temp_target));
      if (dbSettings.humidity_target) setHumidityTarget(String(dbSettings.humidity_target));
    }
  }, [dbSettings]);

  const handleSave = async () => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Changing system preferences requires Admin or Operator privileges.`,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("smartgrow_polling_interval", interval);
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("system_settings").upsert({
        id: "default",
        auto_mode: autoMode,
        temp_target: parseFloat(tempTarget) || 26.0,
        humidity_target: parseFloat(humidityTarget) || 85.0,
        co2_threshold: 600,
        email_alerts: true,
        push_alerts: true,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        toast.error("Save Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });

      // Log to System Logs
      logSystemActivity({
        source: "SETTINGS",
        category: "system",
        severity: "info",
        action: "UPDATE_SETTINGS",
        message: `Updated greenhouse climate setpoints & polling`,
        details: `Target Temp: ${tempTarget}°C, Target Humidity: ${humidityTarget}% RH, Polling: ${parseInt(interval) / 1000}s, Mode: ${autoMode ? "Autonomous" : "Manual Only"}`,
      });

      toast.success("System Preferences Saved", {
        description: `Live polling set to ${parseInt(interval) / 1000}s. Target: ${tempTarget}°C & ${humidityTarget}% RH (${autoMode ? "Auto Control" : "Manual Only"}).`,
      });
    } catch {
      toast.error("Failed to save system settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          System Preferences
        </CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
          Configure greenhouse setpoints, polling intervals, and automation mode stored in database.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-5">
        {/* Polling Interval */}
        <div className="space-y-2">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground">Live Telemetry Interval</Label>
            <p className="text-[11px] text-muted-foreground">
              How frequently the web dashboard requests new DHT22 telemetry from Supabase and ESP32.
            </p>
          </div>
          <Select value={interval} onValueChange={setIntervalState}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 Second (Real-time)</SelectItem>
              <SelectItem value="2000">2 Seconds</SelectItem>
              <SelectItem value="5000">5 Seconds</SelectItem>
              <SelectItem value="10000">10 Seconds (Recommended)</SelectItem>
              <SelectItem value="30000">30 Seconds</SelectItem>
              <SelectItem value="60000">1 Minute (Thesis Spec)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Setpoints: Target Temp & Humidity */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Target Temp (°C)</Label>
            <Input
              type="number"
              step="0.5"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              className="h-9 text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground">Optimal: 19°C – 28°C</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Target Humidity (% RH)</Label>
            <Input
              type="number"
              step="1"
              value={humidityTarget}
              onChange={(e) => setHumidityTarget(e.target.value)}
              className="h-9 text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground">Optimal: 70% – 85% RH</p>
          </div>
        </div>

        {/* Autonomous Climate Mode Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Bot className="size-3.5 text-primary" />
              <Label className="text-xs font-semibold text-foreground">Autonomous Climate Control</Label>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {autoMode ? "Automations & schedules active" : "Manual override mode only"}
            </p>
          </div>
          <Switch
            checked={autoMode}
            onCheckedChange={setAutoMode}
            disabled={!canControlDevices}
          />
        </div>

        {/* Save Button */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving || !canControlDevices || isLoading} className="w-full gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving Setpoints..." : "Apply Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
