import { LoadingScreen } from "@/components/loading-screen";

export default function RootLoading() {
  return (
    <LoadingScreen
      title="Loading SmartGrow..."
      subtitle="Initializing greenhouse telemetry and automation controls."
    />
  );
}
