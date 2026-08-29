import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete user from Supabase database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("Failed to delete user record from Supabase:", dbError);
    }

    // 2. Delete user from Clerk
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch (clerkErr: unknown) {
      console.error("Clerk deleteUser notice:", clerkErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete account" },
      { status: 500 }
    );
  }
}
