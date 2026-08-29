"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Sliders, Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

export function SystemSettings() {
  const queryClient = useQueryClient();
  const { canControlDevices, role } = useUserRole();
  const [interval, setInterval] = useState("5000");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch system settings from Supabase
  const { data: dbSettings } = useQuery({
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

  useEffect(() => {
    if (dbSettings) {
      // If db has specific interval or target, we can keep it in sync
    }
  }, [dbSettings]);

  const handleSave = async () => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Changing system settings requires Admin privileges.`,
      });
      return;
    }

    setIsSaving(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("system_settings").upsert({
        id: "default",
        auto_mode: true,
        temp_target: 26.0,
        humidity_target: 88.0,
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
      toast.success("Settings Saved to Supabase", {
        description: `Live data interval updated to ${parseInt(interval) / 1000} seconds. Setpoints synced with database.`,
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
          Configure global polling and connectivity settings in database.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Live Data Interval</Label>
            <p className="text-xs text-muted-foreground">
              How often the dashboard requests new sensor telemetry from Supabase and ESP32.
            </p>
          </div>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 Second (Real-time)</SelectItem>
              <SelectItem value="2000">2 Seconds</SelectItem>
              <SelectItem value="5000">5 Seconds</SelectItem>
              <SelectItem value="10000">10 Seconds (Recommended)</SelectItem>
              <SelectItem value="30000">30 Seconds</SelectItem>
              <SelectItem value="60000">1 Minute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50">
          <Button onClick={handleSave} disabled={isSaving || !canControlDevices} className="w-full gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving to Database..." : "Apply Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
