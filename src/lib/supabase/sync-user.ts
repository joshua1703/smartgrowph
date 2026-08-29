import { createBrowserClient } from "@supabase/ssr";
import type { Database, UserRole } from "./types";

interface SyncUserParams {
  id: string;
  email: string;
  fullName?: string | null;
  avatar?: string | null;
  token?: string | null;
}

/**
 * Synchronizes a Clerk user profile into Supabase's public.users table.
 * Defaults newly registered accounts to 'viewer', while preserving existing roles.
 */
export async function syncClerkUserToSupabase({
  id,
  email,
  fullName,
  avatar,
  token,
}: SyncUserParams) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    global: {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    },
  });

  const { data: existingUser } = await supabase
    .from("users")
    .select("role, status, zone")
    .eq("id", id)
    .maybeSingle();

  const isPrimaryAdmin = email.toLowerCase() === "eala.joshuamark@gmail.com";
  const assignedRole: UserRole =
    existingUser?.role || (isPrimaryAdmin ? "admin" : "viewer");
  const assignedStatus = existingUser?.status || "active";
  const assignedZone = existingUser?.zone || "All Zones";

  const { data, error } = await supabase.from("users").upsert(
    {
      id,
      email,
      full_name: fullName || email.split("@")[0],
      avatar: avatar || null,
      avatar_gradient: "from-emerald-500 to-teal-600",
      role: assignedRole,
      status: assignedStatus,
      zone: assignedZone,
      last_active: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Failed to sync Clerk user to Supabase:", error);
    return { success: false, error };
  }

  return { success: true, data, role: assignedRole };
}
