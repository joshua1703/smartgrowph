"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

export function DeviceAutomation() {
  const [rules, setRules] = useState([
    { id: 1, sensor: "temperature", condition: ">", threshold: 28, actuator: "fan", active: true },
    { id: 2, sensor: "humidity", condition: "<", threshold: 75, actuator: "fogger", active: true },
  ]);

  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newSensor, setNewSensor] = useState("temperature");
  const [newCondition, setNewCondition] = useState(">");
  const [newThreshold, setNewThreshold] = useState("30");
  const [newActuator, setNewActuator] = useState("fan");

  const toggleRule = (id: number) => {
    const target = rules.find((r) => r.id === id);
    setRules(rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    if (target) {
      if (!target.active) {
        toast.success("Automation Rule Enabled", {
          description: `Auto-trigger active: ${target.sensor} ${target.condition} ${target.threshold} → ${target.actuator}`,
        });
      } else {
        toast.info("Automation Rule Disabled", {
          description: `Auto-trigger paused for ${target.actuator}.`,
        });
      }
    }
  };

  const removeRule = (id: number) => {
    const target = rules.find((r) => r.id === id);
    setRules(rules.filter((r) => r.id !== id));
    toast.error("Automation Rule Removed", {
      description: `Rule for ${target?.actuator || "actuator"} has been deleted.`,
    });
  };

  const handleAddRule = () => {
    const newId = rules.length > 0 ? Math.max(...rules.map((r) => r.id)) + 1 : 1;
    const thresholdVal = parseInt(newThreshold) || 0;
    setRules([
      ...rules,
      {
        id: newId,
        sensor: newSensor,
        condition: newCondition,
        threshold: thresholdVal,
        actuator: newActuator,
        active: true,
      },
    ]);
    toast.success("New Automation Rule Saved", {
      description: `Trigger ${newActuator} when ${newSensor} ${newCondition} ${thresholdVal}`,
    });
    setIsAddRuleOpen(false);
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
              Auto-trigger actuators based on Oyster Mushroom sensor readings.
            </CardDescription>
          </div>
          <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
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
                  <Label className="text-right">Sensor</Label>
                  <Select value={newSensor} onValueChange={setNewSensor}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="co₂">CO₂ Level</SelectItem>
                      <SelectItem value="light">Light Intensity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Condition</Label>
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
                  <Label className="text-right">Threshold</Label>
                  <Input 
                    type="number" 
                    value={newThreshold} 
                    onChange={(e) => setNewThreshold(e.target.value)} 
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Actuator</Label>
                  <Select value={newActuator} onValueChange={setNewActuator}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">Fan (Cooling)</SelectItem>
                      <SelectItem value="fogger">Fogger (Humidity)</SelectItem>
                      <SelectItem value="sprinkler">Sprinkler (Watering)</SelectItem>
                      <SelectItem value="exhaust">Exhaust Vent (CO₂)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRule}>Save Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold capitalize text-foreground">{rule.sensor}</span>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{rule.condition} {rule.threshold}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm font-medium capitalize text-primary">{rule.actuator}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/80">
                When {rule.sensor} is {rule.condition === ">" ? "greater than" : rule.condition === "<" ? "less than" : "equal to"} {rule.threshold}, turn on {rule.actuator}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule.id)} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRule(rule.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No automations configured.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click the + button to add one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
