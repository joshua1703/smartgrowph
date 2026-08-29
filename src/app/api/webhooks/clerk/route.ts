import { NextResponse } from "next/server";
import { createBrowserClient } from "@supabase/ssr";
import type { Database, UserRole } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

interface ClerkWebhookEvent {
  data: {
    id: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    username?: string | null;
    primary_email_address_id?: string | null;
  };
  type: string;
}

export async function POST(req: Request) {
  try {
    const payload: ClerkWebhookEvent = await req.json();
    const eventType = payload.type;
    const { id, first_name, last_name, email_addresses, image_url, username } = payload.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

    const primaryEmail = email_addresses?.[0]?.email_address;
    const fullName =
      `${first_name || ""} ${last_name || ""}`.trim() || username || primaryEmail?.split("@")[0] || "User";

    if (eventType === "user.created" || eventType === "user.updated") {
      if (!primaryEmail) {
        return NextResponse.json({ message: "No email provided" }, { status: 400 });
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select("role, status, zone")
        .eq("id", id)
        .maybeSingle();

      const isPrimaryAdmin = primaryEmail.toLowerCase() === "eala.joshuamark@gmail.com";
      const assignedRole: UserRole =
        existingUser?.role || (isPrimaryAdmin ? "admin" : "viewer");
      const assignedStatus = existingUser?.status || "active";
      const assignedZone = existingUser?.zone || "All Zones";

      const { error } = await supabase.from("users").upsert(
        {
          id,
          email: primaryEmail,
          full_name: fullName,
          avatar: image_url || null,
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
        console.error("Webhook Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: "User synced successfully" }, { status: 200 });
    }

    if (eventType === "user.deleted") {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) {
        console.error("Webhook delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: "User deleted from Supabase" }, { status: 200 });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (err: unknown) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Error" },
      { status: 500 }
    );
  }
}
