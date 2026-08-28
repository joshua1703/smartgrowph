"use client";

import { useState } from "react";
import { Activity, Save } from "lucide-react";
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

export function SystemSettings() {
  const [interval, setInterval] = useState("5000");

  const handleSave = () => {
    toast.success("Settings saved", {
      description: `Live data interval updated to ${parseInt(interval) / 1000} seconds.`,
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          System Preferences
        </CardTitle>
        <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
          Configure global polling and connectivity settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm font-semibold">Live Data Interval</Label>
            <p className="text-xs text-muted-foreground">
              How often the dashboard requests new sensor data from the ESP32.
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
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Apply Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
