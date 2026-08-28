"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const LIVE_LOG_EVENTS = [
  {
    type: "info" as const,
    title: "Actuator Event: Exhaust Fan ON",
    description: "Zone A temperature reached 28.5°C — auto exhaust cycle initiated.",
  },
  {
    type: "success" as const,
    title: "Telemetry Sync Complete",
    description: "144 DHT22 sensor readings uploaded to MySQL Database.",
  },
  {
    type: "warning" as const,
    title: "Microclimate Alert: Humidity Low",
    description: "Zone B dropped to 78% RH — ultrasonic fogger relay started.",
  },
  {
    type: "info" as const,
    title: "Closed-Loop Balance Restored",
    description: "Zone A humidity stabilized at 89% RH · Fan RPM normalized.",
  },
  {
    type: "success" as const,
    title: "ESP32 Hardware Heartbeat",
    description: "Node 01 operational · RSSI: -58 dBm · All relays responsive.",
  },
];

export function LiveToastStreamer() {
  const indexRef = useRef(0);

  useEffect(() => {
    // Initial welcome telemetry toast after dashboard loads
    const initialTimer = setTimeout(() => {
      toast.success("ESP32 Telemetry Connected", {
        description: "Live greenhouse stream active. Monitoring 4 sensor nodes.",
      });
    }, 2000);

    // Periodic stream of realistic greenhouse automation logs
    const interval = setInterval(() => {
      const event = LIVE_LOG_EVENTS[indexRef.current % LIVE_LOG_EVENTS.length];
      indexRef.current += 1;

      if (event.type === "success") {
        toast.success(event.title, { description: event.description });
      } else if (event.type === "warning") {
        toast.warning(event.title, { description: event.description });
      } else {
        toast.info(event.title, { description: event.description });
      }
    }, 45000); // Friendly 45-second interval for live log notifications

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return null;
}
