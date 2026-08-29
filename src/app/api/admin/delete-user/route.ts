import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const { userId: requesterId } = await auth();

    if (!requesterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Verify requester is admin in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

    const { data: requester } = await supabase
      .from("users")
      .select("role, email")
      .eq("id", requesterId)
      .maybeSingle();

    const isPrimaryAdmin = requester?.email?.toLowerCase() === "eala.joshuamark@gmail.com";
    if (requester?.role !== "admin" && !isPrimaryAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can delete accounts." },
        { status: 403 }
      );
    }

    // Prevent deleting the primary admin account
    const { data: targetUser } = await supabase
      .from("users")
      .select("email")
      .eq("id", targetUserId)
      .maybeSingle();

    if (targetUser?.email?.toLowerCase() === "eala.joshuamark@gmail.com") {
      return NextResponse.json(
        { error: "The primary root administrator account cannot be deleted." },
        { status: 400 }
      );
    }

    // 2. Delete user from Supabase database
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("id", targetUserId);

    if (dbError) {
      console.error("Supabase user deletion error:", dbError);
    }

    // 3. Delete user from Clerk
    try {
      const client = await clerkClient();
      await client.users.deleteUser(targetUserId);
    } catch (clerkErr: unknown) {
      console.warn("Clerk deleteUser notice:", clerkErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Admin user delete error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
