import { LoadingScreen } from "@/components/loading-screen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      title="Loading Greenhouse Dashboard..."
      subtitle="Fetching real-time DHT22 sensors, actuator relays, and batch metrics."
    />
  );
}
