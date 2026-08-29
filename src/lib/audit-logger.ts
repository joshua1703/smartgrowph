import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export interface LogActivityParams {
  source: "AUTH" | "BATCH" | "AUTOMATION" | "SCHEDULE" | "ACTUATOR" | "USER_MGMT" | "SETTINGS" | "SENSOR";
  category: "auth" | "crud" | "automation" | "schedule" | "alert" | "system";
  severity?: "info" | "warning" | "critical" | "success";
  action: string;
  message: string;
  details?: string;
  zone?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

/**
 * Universal System & Audit Logger:
 * Records logins, batch changes, user role updates, threshold warnings, and device operations.
 */
export async function logSystemActivity({
  source,
  category,
  severity = "info",
  action,
  message,
  details,
  zone = "Fruiting Bay",
  userId,
  userName,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const logId = `LOG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 1. Try inserting to system_logs
    const { error: systemLogError } = await (supabase as any)
      .from("system_logs")
      .insert({
        id: logId,
        user_id: userId || null,
        user_name: userName || null,
        source,
        category,
        severity,
        action,
        message,
        details: details || message,
        zone,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      });

    // 2. Also ensure actuator/operational events stay in actuator_logs for physical actuator metrics
    if (source === "ACTUATOR" || source === "AUTOMATION" || source === "SCHEDULE") {
      const actuatorType = (metadata?.actuator_type || "fan") as any;
      const duration = metadata?.duration || 10;
      const power = metadata?.power_consumption || 35;

      await supabase.from("actuator_logs").insert({
        id: logId,
        actuator_id: metadata?.actuator_id || `${source}-01`,
        actuator_name: metadata?.actuator_name || message,
        actuator_type: actuatorType,
        zone,
        action: action.toLowerCase() === "deactivated" ? "deactivated" : "activated",
        trigger: (category === "schedule" ? "schedule" : category === "automation" ? "auto" : "manual") as any,
        duration,
        power_consumption: power,
        reason: details || message,
      });
    }
  } catch (err) {
    console.warn("Non-fatal system activity log notice:", err);
  }
}
