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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Control Panel */}
        <div className="col-span-1 lg:col-span-1">
          <DeviceControl />
        </div>

        {/* Automations */}
        <div className="col-span-1 lg:col-span-1">
          <DeviceAutomation />
        </div>

        {/* Schedules */}
        <div className="col-span-1 lg:col-span-1">
          <DeviceSchedules />
        </div>

        {/* System Settings */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 max-w-xl">
          <SystemSettings />
        </div>
      </div>
    </div>
  );
}
