"use client";

import { useState } from "react";
import { Fan, Droplets, CloudRain, Wind } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "fan", name: "Fan (Cooling)", icon: Fan, color: "text-sky-500", bg: "bg-sky-500/10" },
  { id: "fogger", name: "Fogger (Humidity)", icon: CloudRain, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "sprinkler", name: "Sprinkler (Watering)", icon: Droplets, color: "text-violet-500", bg: "bg-violet-500/10" },
  { id: "exhaust", name: "Exhaust Vent (CO₂)", icon: Wind, color: "text-amber-500", bg: "bg-amber-500/10" },
];

export function DeviceControl() {
  const [deviceState, setDeviceState] = useState<Record<string, boolean>>({
    fan: true,
    fogger: false,
    sprinkler: false,
    exhaust: true,
  });

  const toggleDevice = (id: string, name: string) => {
    const nextState = !deviceState[id];
    setDeviceState((prev) => ({
      ...prev,
      [id]: nextState,
    }));

    if (nextState) {
      toast.success(`${name} Activated`, {
        description: "Relay energized. ESP32 command dispatched to greenhouse zone.",
      });
    } else {
      toast.info(`${name} Deactivated`, {
        description: "Relay de-energized. Returned to automatic standby.",
      });
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight text-foreground">
          IoT Device Control
        </CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
          Manual override for actuators in the Oyster Mushroom greenhouse.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center gap-4">
        {DEVICES.map((device) => {
          const isActive = deviceState[device.id];
          return (
            <div
              key={device.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                    isActive ? device.bg : "bg-muted"
                  )}
                >
                  <device.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? device.color : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {device.name}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-1">
                    {isActive ? "Currently Active" : "Inactive"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={() => toggleDevice(device.id, device.name)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
