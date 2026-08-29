"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database, ActuatorType } from "@/lib/supabase/types";
import { Fan, Droplets, CloudRain, Wind, Sun, Lock, Cpu } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/use-user-role";

const DEFAULT_DEVICES = [
  { id: "FAN-01", name: "Exhaust Fan A", type: "fan" as const, zone: "Zone A", wattBase: 45 },
  { id: "FAN-02", name: "Exhaust Fan B", type: "fan" as const, zone: "Zone B", wattBase: 45 },
  { id: "FOG-01", name: "Fogger Unit 1", type: "fogger" as const, zone: "Zone A", wattBase: 35 },
  { id: "FOG-02", name: "Fogger Unit 2", type: "fogger" as const, zone: "Zone C", wattBase: 35 },
  { id: "SPR-01", name: "Sprinkler System", type: "sprinkler" as const, zone: "Zone D", wattBase: 60 },
  { id: "LED-01", name: "LED Grow Light A", type: "led" as const, zone: "Zone A", wattBase: 120 },
];

function getDeviceIcon(type: string) {
  switch (type) {
    case "fan":
      return { icon: Fan, color: "text-sky-400", bg: "bg-sky-500/10" };
    case "fogger":
      return { icon: CloudRain, color: "text-emerald-400", bg: "bg-emerald-500/10" };
    case "sprinkler":
      return { icon: Droplets, color: "text-violet-400", bg: "bg-violet-500/10" };
    case "led":
      return { icon: Sun, color: "text-amber-400", bg: "bg-amber-500/10" };
    default:
      return { icon: Wind, color: "text-primary", bg: "bg-primary/10" };
  }
}

export function DeviceControl() {
  const queryClient = useQueryClient();
  const { canControlDevices, role, isViewer } = useUserRole();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // 1. TanStack Query: Fetch Actuators from Supabase
  const { data: actuators = [], isLoading } = useQuery({
    queryKey: ["iot-actuators"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("actuators")
        .select("*")
        .order("id", { ascending: true });

      if (error || !data || data.length === 0) {
        // Auto-seed default actuators if table is currently empty
        for (const dev of DEFAULT_DEVICES) {
          await supabase.from("actuators").upsert({
            id: dev.id,
            name: dev.name,
            type: dev.type,
            zone: dev.zone,
            is_active: false,
            status: "normal",
            watt_base: dev.wattBase,
          });
        }
        const { data: seeded } = await supabase.from("actuators").select("*").order("id", { ascending: true });
        return seeded || [];
      }

      return data;
    },
    refetchInterval: 5000,
  });

  // 2. Realtime Subscription on actuators table
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `actuators-sync-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "actuators" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["iot-actuators"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Toggle Actuator State in Supabase + Log Event in actuator_logs
  const toggleDevice = async (id: string, name: string, type: string, zone: string, wattBase: number, currentActive: boolean) => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your account role is '${role.toUpperCase()}'. Manual actuator overrides require Operator, Technician, or Admin privileges.`,
      });
      return;
    }

    const nextState = !currentActive;
    setTogglingId(id);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // 1. Update actuator row in Supabase
      const { error: updateError } = await supabase
        .from("actuators")
        .update({
          is_active: nextState,
          last_toggled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        toast.error("Database Update Failed", { description: updateError.message });
        return;
      }

      // 2. Insert event log into actuator_logs table
      const logId = `AL-${Date.now().toString().slice(-6)}`;
      await supabase.from("actuator_logs").insert({
        id: logId,
        actuator_id: id,
        actuator_name: name,
        actuator_type: type as ActuatorType,
        zone: zone || "Zone A",
        action: nextState ? "activated" : "deactivated",
        trigger: "manual",
        duration: nextState ? null : 15,
        power_consumption: wattBase || 45,
        reason: `Manual toggle override via Dashboard by ${role.toUpperCase()} user`,
      });

      // 3. Invalidate query caches
      queryClient.invalidateQueries({ queryKey: ["iot-actuators"] });
      queryClient.invalidateQueries({ queryKey: ["actuator-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });

      if (nextState) {
        toast.success(`${name} Activated`, {
          description: `Relay energized in ${zone}. Command logged in database.`,
        });
      } else {
        toast.info(`${name} Deactivated`, {
          description: `Relay de-energized. Returned to standby mode.`,
        });
      }
    } catch {
      toast.error("Action failed. Check database connection.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground">
            IoT Device Control
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
            Manual override for actuators connected to the database.
          </CardDescription>
        </div>
        {isViewer && (
          <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-400 gap-1 bg-amber-500/10">
            <Lock className="size-3" />
            View-Only
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center gap-3">
        {isLoading && actuators.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            <Cpu className="size-6 mx-auto mb-2 animate-pulse text-muted-foreground/40" />
            Connecting to device relays in Supabase...
          </div>
        ) : (
          actuators.map((device) => {
            const iconConfig = getDeviceIcon(device.type);
            const DeviceIcon = iconConfig.icon;
            const isToggling = togglingId === device.id;

            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 transition-all hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      device.is_active ? iconConfig.bg : "bg-muted"
                    )}
                  >
                    <DeviceIcon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        device.is_active ? iconConfig.color : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-foreground leading-none">
                        {device.name}
                      </p>
                      <span className="text-[9px] font-mono text-muted-foreground/60">
                        {device.zone}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground mt-1">
                      {device.is_active ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Currently Active ({device.watt_base}W)
                        </span>
                      ) : (
                        "Standby Mode"
                      )}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={device.is_active}
                  disabled={!canControlDevices || isToggling}
                  onCheckedChange={() =>
                    toggleDevice(
                      device.id,
                      device.name,
                      device.type,
                      device.zone,
                      device.watt_base,
                      device.is_active
                    )
                  }
                  className={!canControlDevices ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
