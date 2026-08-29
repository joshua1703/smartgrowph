import { NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User has no email" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

    // Check if user already has an established role in the database
    const { data: existingUser } = await supabase
      .from("users")
      .select("role, status, zone")
      .eq("id", user.id)
      .maybeSingle();

    // Default primary admin account or viewer for newly registered users
    const isPrimaryAdmin =
      email.toLowerCase() === "eala.joshuamark@gmail.com";

    const assignedRole =
      existingUser?.role || (isPrimaryAdmin ? "admin" : "viewer");
    const assignedStatus = existingUser?.status || "active";
    const assignedZone = existingUser?.zone || "All Zones";

    const fullName =
      user.fullName ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.username ||
      email.split("@")[0];

    const { data, error } = await supabase.from("users").upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        avatar: user.imageUrl || null,
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
      console.error("Supabase user sync error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, role: assignedRole });
  } catch (err: unknown) {
    console.error("Server sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
