"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Plus, Trash2, Clock, Calendar, Cpu } from "lucide-react";
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
import { logSystemActivity } from "@/lib/audit-logger";

export function DeviceSchedules() {
  const queryClient = useQueryClient();
  const { canControlDevices, role } = useUserRole();

  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newTime, setNewTime] = useState("08:00");
  const [newDuration, setNewDuration] = useState("15 mins");
  const [newActuator, setNewActuator] = useState("sprinkler");
  const [newDays, setNewDays] = useState("Daily");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Schedules from Supabase
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["device-schedules"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from("device_schedules")
        .select("*")
        .order("start_time", { ascending: true });

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
    const channelId = `schedules-sync-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_schedules" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["device-schedules"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Toggle Schedule State in Supabase
  const toggleSchedule = async (id: string, currentActive: boolean, device: string, time: string) => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Managing schedules requires Operator or Admin privileges.`,
      });
      return;
    }

    const nextActive = !currentActive;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("device_schedules")
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("Update Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["device-schedules"] });

      // Log to System Logs
      logSystemActivity({
        source: "SCHEDULE",
        category: "crud",
        severity: "info",
        action: nextActive ? "ACTIVATE_SCHEDULE" : "PAUSE_SCHEDULE",
        message: `${nextActive ? "Activated" : "Paused"} timer schedule for ${device}`,
        details: `Start time: ${time}. Schedule ID: ${id}`,
      });

      if (nextActive) {
        toast.success("Schedule Activated", {
          description: `${device} timer active at ${time}.`,
        });
      } else {
        toast.info("Schedule Paused", {
          description: `${device} timer paused.`,
        });
      }
    } catch {
      toast.error("Failed to toggle schedule.");
    }
  };

  // Remove Schedule from Supabase
  const removeSchedule = async (id: string, device: string) => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Managing schedules requires Operator or Admin privileges.`,
      });
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from("device_schedules")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Delete Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["device-schedules"] });

      // Log to System Logs
      logSystemActivity({
        source: "SCHEDULE",
        category: "crud",
        severity: "warning",
        action: "DELETE_SCHEDULE",
        message: `Deleted schedule for ${device}`,
        details: `Removed timer from database.`,
      });

      toast.error("Schedule Removed", {
        description: `Schedule for ${device} has been removed from database.`,
      });
    } catch {
      toast.error("Failed to delete schedule.");
    }
  };

  // Add Schedule in Supabase
  const handleAddSchedule = async () => {
    if (!canControlDevices) {
      toast.error("Permission Denied", {
        description: `Your role is '${role.toUpperCase()}'. Managing schedules requires Operator or Admin privileges.`,
      });
      return;
    }

    const daysArray =
      newDays === "Daily"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : newDays === "Mon, Wed, Fri"
        ? ["Mon", "Wed", "Fri"]
        : ["Sat", "Sun"];

    setIsSaving(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("device_schedules").insert({
        device: newActuator,
        start_time: newTime,
        end_time: newDuration,
        days: daysArray,
        is_active: true,
      });

      if (error) {
        toast.error("Save Failed", { description: error.message });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["device-schedules"] });

      // Log to System Logs
      logSystemActivity({
        source: "SCHEDULE",
        category: "crud",
        severity: "success",
        action: "CREATE_SCHEDULE",
        message: `Created scheduled action for ${newActuator}`,
        details: `Scheduled at ${newTime} (${newDuration}, ${newDays})`,
      });

      toast.success("New Schedule Created", {
        description: `${newActuator} scheduled for ${newTime} (${newDuration}, ${newDays})`,
      });
      setIsAddScheduleOpen(false);
    } catch {
      toast.error("Failed to create schedule.");
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
              Scheduled Actions
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
              Run actuators on a fixed time schedule saved in Supabase.
            </CardDescription>
          </div>
          <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={!canControlDevices}>
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
                  <Label className="text-right text-xs">Start Time</Label>
                  <Input 
                    type="time" 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Duration</Label>
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
                  <Label className="text-right text-xs">Actuator</Label>
                  <Select value={newActuator} onValueChange={setNewActuator}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">Fan (Cooling)</SelectItem>
                      <SelectItem value="fogger">Fogger (Humidity)</SelectItem>
                      <SelectItem value="sprinkler">Sprinkler (Watering)</SelectItem>
                      <SelectItem value="led">LED Grow Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Frequency</Label>
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
                <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleAddSchedule} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {isLoading && schedules.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            <Cpu className="size-6 mx-auto mb-2 animate-pulse text-muted-foreground/40" />
            Loading schedules from Supabase...
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/10 rounded-xl border border-dashed border-border/60">
            <Calendar className="size-7 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No schedules configured</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Click the + button to create a timer.</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">{schedule.start_time}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                    {schedule.device}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium">{Array.isArray(schedule.days) ? schedule.days.join(", ") : "Daily"}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/40"></span>
                  <span>Run for {schedule.end_time || "15 mins"}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={schedule.is_active}
                  disabled={!canControlDevices}
                  onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active, schedule.device, schedule.start_time)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={!canControlDevices}
                  onClick={() => removeSchedule(schedule.id, schedule.device)}
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
