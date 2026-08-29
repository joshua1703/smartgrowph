import { PageHeader } from "@/components/dashboard/page-header";
import { DeviceControl } from "@/components/dashboard/device-control";
import { DeviceAutomation } from "@/components/dashboard/device-automation";
import { DeviceSchedules } from "@/components/dashboard/device-schedules";
import { SystemSettings } from "@/components/dashboard/system-settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IoT Control — SmartGrow",
  description: "Manually control IoT actuators in the SmartGrow oyster mushroom greenhouse.",
};

export default function IoTControlPage() {
  return (
    <div className="flex-1 space-y-6 p-6 pt-6 bg-background min-h-screen text-foreground">
      <PageHeader
        supertitle="Environment Control"
        title="IoT Device Control"
        subtitle="Manage overrides, automations, schedules, and preferences for the Oyster Mushroom greenhouse."
      />

      {/* 2x2 Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Manual Actuator Overrides */}
        <DeviceControl />

        {/* 2. Global Climate Preferences & Setpoints */}
        <SystemSettings />

        {/* 3. Sensor-Driven Automations */}
        <DeviceAutomation />

        {/* 4. Scheduled Timed Actions */}
        <DeviceSchedules />
      </div>
    </div>
  );
}
