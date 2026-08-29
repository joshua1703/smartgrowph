"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database, ActuatorType } from "@/lib/supabase/types";
import { toast } from "sonner";

/**
 * Normalizes time strings like "13:23", "01:23 PM", "1:23 PM" into standard "HH:mm" (24-hour)
 */
function normalizeTo24Hour(timeStr: string): string {
  if (!timeStr) return "";
  const cleaned = timeStr.trim();

  // If already in HH:mm format (e.g. "13:23" or "08:00")
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [h, m] = cleaned.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }

  // If in 12-hour format with AM/PM (e.g. "01:23 PM", "8:00 AM")
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3].toUpperCase();

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }

  return cleaned;
}

/**
 * Parses duration strings like "15 mins", "30 mins", "1 hour", "5 mins" into integer minutes
 */
function parseDurationMinutes(durationStr: string | null): number {
  if (!durationStr) return 15;
  if (durationStr.includes("hour")) {
    const hrs = parseInt(durationStr, 10) || 1;
    return hrs * 60;
  }
  return parseInt(durationStr, 10) || 15;
}

interface ActiveTimer {
  actuatorId: string;
  actuatorName: string;
  shutoffTime: number; // unix ms
  durationLabel: string;
}

export function AutomationRunner() {
  const queryClient = useQueryClient();
  const triggeredSchedulesRef = useRef<Set<string>>(new Set());
  const triggeredAutomationsRef = useRef<Set<string>>(new Set());
  const activeTimersRef = useRef<Map<string, ActiveTimer>>(new Map());

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

    const evaluateRulesAndSchedules = async () => {
      try {
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, "0");
        const currentMin = now.getMinutes().toString().padStart(2, "0");
        const current24Time = `${currentHour}:${currentMin}`; // e.g. "13:23"
        const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];

        const minuteKey = `${currentDay}-${current24Time}`;

        // 1. Fetch current actuators
        const { data: actuators } = await supabase.from("actuators").select("*");
        if (!actuators || actuators.length === 0) return;

        // ── 2. AUTO-SHUTOFF CHECK: Check if any active scheduled timer expired ──
        const nowMs = Date.now();
        for (const [actuatorId, timer] of activeTimersRef.current.entries()) {
          if (nowMs >= timer.shutoffTime) {
            activeTimersRef.current.delete(actuatorId);

            const targetActuator = actuators.find((a) => a.id === actuatorId);
            if (targetActuator && targetActuator.is_active) {
              // Deactivate actuator in Supabase
              await supabase
                .from("actuators")
                .update({
                  is_active: false,
                  last_toggled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", actuatorId);

              // Log deactivation to actuator_logs
              const logId = `AL-${Date.now().toString().slice(-6)}`;
              await supabase.from("actuator_logs").insert({
                id: logId,
                actuator_id: actuatorId,
                actuator_name: timer.actuatorName,
                actuator_type: targetActuator.type as ActuatorType,
                zone: targetActuator.zone || "Fruiting Bay",
                action: "deactivated",
                trigger: "schedule",
                duration: parseDurationMinutes(timer.durationLabel),
                power_consumption: targetActuator.watt_base || 40,
                reason: `Scheduled duration finished (${timer.durationLabel}). Standby restored.`,
              });

              toast.info(`Schedule Completed: ${timer.actuatorName}`, {
                description: `Actuator automatically turned OFF after running for ${timer.durationLabel}.`,
              });

              queryClient.invalidateQueries({ queryKey: ["iot-actuators"] });
              queryClient.invalidateQueries({ queryKey: ["actuator-logs"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard-activity-feed"] });
            }
          }
        }

        // ── 3. SCHEDULE TRIGGER CHECK: Check if current time triggers a schedule ──
        const { data: schedules } = await supabase
          .from("device_schedules")
          .select("*")
          .eq("is_active", true);

        if (schedules && schedules.length > 0) {
          for (const s of schedules) {
            const scheduleTime24 = normalizeTo24Hour(s.start_time);
            const daysArray = Array.isArray(s.days) ? s.days : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const isToday = daysArray.includes(currentDay);

            if (isToday && scheduleTime24 === current24Time) {
              const runKey = `sched-${s.id}-${minuteKey}`;
              if (!triggeredSchedulesRef.current.has(runKey)) {
                triggeredSchedulesRef.current.add(runKey);

                // Find matching actuator by type or name
                const targetType = s.device.toLowerCase();
                const matchedActuator = actuators.find(
                  (a) =>
                    a.type.toLowerCase() === targetType ||
                    a.name.toLowerCase().includes(targetType) ||
                    a.id.toLowerCase().includes(targetType)
                );

                if (matchedActuator && !matchedActuator.is_active) {
                  const durationMinutes = parseDurationMinutes(s.end_time);

                  // Set auto-shutoff timer
                  activeTimersRef.current.set(matchedActuator.id, {
                    actuatorId: matchedActuator.id,
                    actuatorName: matchedActuator.name,
                    shutoffTime: Date.now() + durationMinutes * 60 * 1000,
                    durationLabel: s.end_time || "15 mins",
                  });

                  // Turn ON actuator in Supabase
                  await supabase
                    .from("actuators")
                    .update({
                      is_active: true,
                      last_toggled_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", matchedActuator.id);

                  // Insert log entry into actuator_logs
                  const logId = `AL-${Date.now().toString().slice(-6)}`;
                  await supabase.from("actuator_logs").insert({
                    id: logId,
                    actuator_id: matchedActuator.id,
                    actuator_name: matchedActuator.name,
                    actuator_type: matchedActuator.type as ActuatorType,
                    zone: matchedActuator.zone || "Fruiting Bay",
                    action: "activated",
                    trigger: "schedule",
                    duration: durationMinutes,
                    power_consumption: matchedActuator.watt_base || 40,
                    reason: `Fixed timer triggered at ${s.start_time} (Runs for ${s.end_time || "15 mins"})`,
                  });

                  toast.success(`Schedule Triggered: ${matchedActuator.name}`, {
                    description: `Actuator activated at ${s.start_time}. Will run for ${s.end_time || "15 mins"}.`,
                  });

                  queryClient.invalidateQueries({ queryKey: ["iot-actuators"] });
                  queryClient.invalidateQueries({ queryKey: ["actuator-logs"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-activity-feed"] });
                }
              }
            }
          }
        }

        // ── 4. SENSOR AUTOMATION TRIGGER CHECK ──
        const { data: automations } = await supabase
          .from("device_automations")
          .select("*")
          .eq("is_enabled", true);

        const { data: latestReading } = await supabase
          .from("sensor_readings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (automations && automations.length > 0 && latestReading) {
          for (const auto of automations) {
            const conditionType = auto.condition_type.toLowerCase();
            let sensorVal: number | null = null;

            if (conditionType.includes("temp")) {
              sensorVal = Number(latestReading.temperature);
            } else if (conditionType.includes("humid")) {
              sensorVal = Number(latestReading.humidity);
            } else if (conditionType.includes("co2")) {
              sensorVal = Number(latestReading.co2_level);
            }

            if (sensorVal !== null) {
              const threshold = Number(auto.threshold);
              let shouldTrigger = false;

              if (auto.operator === ">" && sensorVal > threshold) shouldTrigger = true;
              if (auto.operator === ">=" && sensorVal >= threshold) shouldTrigger = true;
              if (auto.operator === "<" && sensorVal < threshold) shouldTrigger = true;
              if (auto.operator === "<=" && sensorVal <= threshold) shouldTrigger = true;
              if (auto.operator === "==" && Math.round(sensorVal) === Math.round(threshold)) shouldTrigger = true;

              const targetType = auto.device.toLowerCase();
              const matchedActuator = actuators.find(
                (a) =>
                  a.type.toLowerCase() === targetType ||
                  a.name.toLowerCase().includes(targetType) ||
                  a.id.toLowerCase().includes(targetType)
              );

              if (shouldTrigger && matchedActuator && !matchedActuator.is_active) {
                const autoKey = `auto-${auto.id}-${matchedActuator.id}`;
                if (!triggeredAutomationsRef.current.has(autoKey)) {
                  triggeredAutomationsRef.current.add(autoKey);

                  await supabase
                    .from("actuators")
                    .update({
                      is_active: true,
                      last_toggled_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", matchedActuator.id);

                  const logId = `AL-${Date.now().toString().slice(-6)}`;
                  await supabase.from("actuator_logs").insert({
                    id: logId,
                    actuator_id: matchedActuator.id,
                    actuator_name: matchedActuator.name,
                    actuator_type: matchedActuator.type as ActuatorType,
                    zone: matchedActuator.zone || "Fruiting Bay",
                    action: "activated",
                    trigger: "auto",
                    duration: 10,
                    power_consumption: matchedActuator.watt_base || 35,
                    reason: `Sensor Threshold Triggered: ${auto.condition_type} (${sensorVal}) ${auto.operator} ${threshold}`,
                  });

                  toast.success(`Automation Triggered: ${matchedActuator.name}`, {
                    description: `${auto.name} — condition met (${sensorVal}). Relay activated.`,
                  });

                  queryClient.invalidateQueries({ queryKey: ["iot-actuators"] });
                  queryClient.invalidateQueries({ queryKey: ["actuator-logs"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-activity-feed"] });
                }
              } else if (!shouldTrigger && matchedActuator && matchedActuator.is_active) {
                const autoKey = `auto-${auto.id}-${matchedActuator.id}`;
                if (triggeredAutomationsRef.current.has(autoKey)) {
                  triggeredAutomationsRef.current.delete(autoKey);

                  await supabase
                    .from("actuators")
                    .update({
                      is_active: false,
                      last_toggled_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("id", matchedActuator.id);

                  const logId = `AL-${Date.now().toString().slice(-6)}`;
                  await supabase.from("actuator_logs").insert({
                    id: logId,
                    actuator_id: matchedActuator.id,
                    actuator_name: matchedActuator.name,
                    actuator_type: matchedActuator.type as ActuatorType,
                    zone: matchedActuator.zone || "Fruiting Bay",
                    action: "deactivated",
                    trigger: "auto",
                    duration: 10,
                    power_consumption: matchedActuator.watt_base || 35,
                    reason: `Sensor normalized: ${auto.condition_type} (${sensorVal}) returned to optimal range. Standby restored.`,
                  });

                  toast.info(`Sensor Normalized: ${matchedActuator.name}`, {
                    description: `${auto.condition_type} returned to optimal range (${sensorVal}). Standby restored.`,
                  });

                  queryClient.invalidateQueries({ queryKey: ["iot-actuators"] });
                  queryClient.invalidateQueries({ queryKey: ["actuator-logs"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-overview-metrics"] });
                  queryClient.invalidateQueries({ queryKey: ["dashboard-activity-feed"] });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Automation runner evaluation error:", err);
      }
    };

    // Run evaluation immediately and every 3 seconds
    evaluateRulesAndSchedules();
    const interval = setInterval(evaluateRulesAndSchedules, 3000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return null;
}
