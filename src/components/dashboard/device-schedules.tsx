"use client";

import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
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

export function DeviceSchedules() {
  const [schedules, setSchedules] = useState([
    { id: 1, time: "08:00 AM", duration: "15 mins", actuator: "sprinkler", days: "Daily", active: true },
    { id: 2, time: "12:00 PM", duration: "30 mins", actuator: "fan", days: "Mon, Wed, Fri", active: false },
  ]);

  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newTime, setNewTime] = useState("06:00 PM");
  const [newDuration, setNewDuration] = useState("10 mins");
  const [newActuator, setNewActuator] = useState("fogger");
  const [newDays, setNewDays] = useState("Daily");

  const toggleSchedule = (id: number) => {
    const target = schedules.find((s) => s.id === id);
    setSchedules(schedules.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    if (target) {
      if (!target.active) {
        toast.success("Schedule Activated", {
          description: `${target.actuator} timer active: ${target.time} (${target.duration})`,
        });
      } else {
        toast.info("Schedule Paused", {
          description: `${target.actuator} timer paused.`,
        });
      }
    }
  };

  const removeSchedule = (id: number) => {
    const target = schedules.find((s) => s.id === id);
    setSchedules(schedules.filter((s) => s.id !== id));
    toast.error("Schedule Removed", {
      description: `Schedule for ${target?.actuator || "actuator"} has been removed.`,
    });
  };

  const handleAddSchedule = () => {
    const newId = schedules.length > 0 ? Math.max(...schedules.map((s) => s.id)) + 1 : 1;
    setSchedules([
      ...schedules,
      {
        id: newId,
        time: newTime,
        duration: newDuration,
        actuator: newActuator,
        days: newDays,
        active: true,
      },
    ]);
    toast.success("New Schedule Created", {
      description: `${newActuator} scheduled for ${newTime} (${newDuration}, ${newDays})`,
    });
    setIsAddScheduleOpen(false);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Scheduled Actions
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Run actuators on a fixed time schedule.
            </CardDescription>
          </div>
          <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Schedule</DialogTitle>
                <DialogDescription>
                  Set a specific time and duration to run an actuator.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Time</Label>
                  <Input 
                    type="text" 
                    placeholder="e.g. 08:00 AM"
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Duration</Label>
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5 mins">5 mins</SelectItem>
                      <SelectItem value="10 mins">10 mins</SelectItem>
                      <SelectItem value="15 mins">15 mins</SelectItem>
                      <SelectItem value="30 mins">30 mins</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Frequency</Label>
                  <Select value={newDays} onValueChange={setNewDays}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Mon, Wed, Fri">Mon, Wed, Fri</SelectItem>
                      <SelectItem value="Weekends">Weekends</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSchedule}>Save Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{schedule.time}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {schedule.actuator}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>{schedule.days}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                <span>Run for {schedule.duration}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={schedule.active} onCheckedChange={() => toggleSchedule(schedule.id)} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeSchedule(schedule.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No schedules configured.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click the + button to add one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
