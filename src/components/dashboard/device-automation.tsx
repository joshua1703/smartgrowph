"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Plus, Trash2, Sliders, Cpu } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUserRole } from "@/lib/use-user-role";

export function DeviceAutomation() {
  const queryClient = useQueryClient();
  const { canControlDevices, role } = useUserRole();

  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newSensor, setNewSensor] = useState("temperature");
  const [newCondition, setNewCondition] = useState(">");
  const [newThreshold, setNewThreshold] = useState("28");
  const [newActuator, setNewActuator] = useState("fan");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Automations from Supabase
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["device-automations"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("device_automations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data;
    },
    refetchInterval: 5000,
  });

  // 2. Realtime Subscription
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `automations-sync-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_automations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["device-automations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Toggle rule status in Supabase
  const toggleRule = async (id: string, currentEnabled: boolean, name: string) => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Managing automations requires Operator or Admin privileges.`,
      });
      return;
    }

    const nextEnabled = !currentEnabled;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("device_automations")
        .update({ is_enabled: nextEnabled, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("Update Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["device-automations"] });

      if (nextEnabled) {
        toast.success("Automation Rule Enabled", {
          description: `Auto-trigger active: ${name}`,
        });
      } else {
        toast.info("Automation Rule Disabled", {
          description: `Auto-trigger paused for ${name}.`,
        });
      }
    } catch {
      toast.error("Failed to update rule.");
    }
  };

  // Remove rule from Supabase
  const removeRule = async (id: string, name: string) => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Managing automations requires Operator or Admin privileges.`,
      });
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("device_automations")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Delete Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["device-automations"] });
      toast.error("Automation Rule Removed", {
        description: `Rule '${name}' has been deleted from database.`,
      });
    } catch {
      toast.error("Failed to delete rule.");
    }
  };

  // Add rule in Supabase
  const handleAddRule = async () => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Managing automations requires Operator or Admin privileges.`,
      });
      return;
    }

    const thresholdVal = parseFloat(newThreshold) || 0;
    const ruleName = `${newSensor} ${newCondition} ${thresholdVal} → ${newActuator}`;
    setIsSaving(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("device_automations").insert({
        name: ruleName,
        device: newActuator,
        condition_type: newSensor,
        operator: newCondition as ">" | "<" | ">=" | "<=" | "==",
        threshold: thresholdVal,
        action: `turn_on_${newActuator}`,
        is_enabled: true,
      });

      if (error) {
        toast.error("Save Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["device-automations"] });
      toast.success("New Automation Rule Saved", {
        description: `Trigger ${newActuator} when ${newSensor} ${newCondition} ${thresholdVal}`,
      });
      setIsAddRuleOpen(false);
    } catch {
      toast.error("Failed to save automation rule.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Sensor Automations
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Auto-trigger actuators based on sensor readings stored in Supabase.
            </CardDescription>
          </div>
          <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={!canControlDevices}>
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Automation Rule</DialogTitle>
                <DialogDescription>
                  Set a condition to automatically trigger an actuator.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Sensor</Label>
                  <Select
                    value={newSensor}
                    onValueChange={(val) => {
                      setNewSensor(val);
                      if (val === "temperature") {
                        setNewCondition(">");
                        setNewThreshold("28");
                        setNewActuator("fan");
                      } else if (val === "humidity") {
                        setNewCondition("<");
                        setNewThreshold("75");
                        setNewActuator("fogger");
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature (°C)</SelectItem>
                      <SelectItem value="humidity">Humidity (% RH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Condition</Label>
                  <Select value={newCondition} onValueChange={setNewCondition}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">Greater than (&gt;)</SelectItem>
                      <SelectItem value="<">Less than (&lt;)</SelectItem>
                      <SelectItem value="==">Equal to (==)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Threshold</Label>
                  <Input 
                    type="number" 
                    value={newThreshold} 
                    onChange={(e) => setNewThreshold(e.target.value)} 
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Actuator</Label>
                  <Select value={newActuator} onValueChange={setNewActuator}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">Cooling Fan</SelectItem>
                      <SelectItem value="fogger">Ultrasonic Fogger</SelectItem>
                      <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                      <SelectItem value="exhaust">Exhaust Vent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRuleOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleAddRule} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Rule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {isLoading && rules.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            <Cpu className="size-6 mx-auto mb-2 animate-pulse text-muted-foreground/40" />
            Loading automations from Supabase...
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/60">
            <Sliders className="size-7 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No automations configured</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Click the + button to add a threshold rule.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold capitalize text-foreground">{rule.condition_type}</span>
                  <span className="text-[11px] font-mono bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">
                    {rule.operator} {rule.threshold}
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs font-bold capitalize text-primary">{rule.device}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/80">
                  When {rule.condition_type} is {rule.operator === ">" ? "greater than" : rule.operator === "<" ? "less than" : "equal to"} {rule.threshold}, activate {rule.device}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={rule.is_enabled}
                  disabled={!canControlDevices}
                  onCheckedChange={() => toggleRule(rule.id, rule.is_enabled, rule.name)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={!canControlDevices}
                  onClick={() => removeRule(rule.id, rule.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
