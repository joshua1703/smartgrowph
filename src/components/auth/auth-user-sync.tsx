"use client";

import { useEffect, useRef } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { toast } from "sonner";

/**
 * Invisible background component that:
 * 1. Mirrors the logged-in Clerk user into Supabase's public.users table.
 * 2. Sends periodic heartbeat to maintain online status.
 * 3. Listens in REAL-TIME for deletion or suspension: if an admin deletes or suspends
 *    the account, it intercepts all errors, shows a clean Sonner toast, and redirects to /login.
 */
export function AuthUserSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { signOut } = useClerk();
  const hasSyncedRef = useRef(false);
  const isTerminatingRef = useRef(false);

  // Global browser error interceptor to catch any stale Clerk session errors
  useEffect(() => {
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const msg = (reason?.message || reason?.toString?.() || "").toLowerCase();
      if (
        msg.includes("no session was found") ||
        msg.includes("session_not_found") ||
        msg.includes("session") ||
        msg.includes("clerk")
      ) {
        // Prevent the red Next.js development overlay from interrupting the UI
        event.preventDefault();
        if (!isTerminatingRef.current) {
          isTerminatingRef.current = true;
          toast.error("Your session has ended. Redirecting to login...");
          window.location.replace("/login");
        }
      }
    }

    function handleError(event: ErrorEvent) {
      const msg = (event.message || "").toLowerCase();
      if (msg.includes("no session was found") || msg.includes("session_not_found")) {
        event.preventDefault();
        if (!isTerminatingRef.current) {
          isTerminatingRef.current = true;
          toast.error("Your session has ended. Redirecting to login...");
          window.location.replace("/login");
        }
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    async function handleAccountRevocation(reason: string) {
      if (isTerminatingRef.current) return;
      isTerminatingRef.current = true;
      toast.error(reason);
      try {
        await signOut().catch(() => {});
      } catch {
        // Silently swallow any session-already-deleted error
      } finally {
        window.location.replace("/login");
      }
    }

    async function triggerSyncAndCheck() {
      try {
        const res = await fetch("/api/sync-user", { method: "POST" });
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          handleAccountRevocation("Your account access has been revoked by an administrator.");
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (data.status === "suspended") {
          handleAccountRevocation("Your account has been suspended by an administrator.");
          return;
        }
      } catch (err) {
        console.warn("User heartbeat sync notice:", err);
      }
    }

    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      triggerSyncAndCheck();
    }

    // Periodic heartbeat & existence verification every 15s
    const interval = setInterval(triggerSyncAndCheck, 15000);

    // Instant Supabase Realtime listener for account deletion or status change
    let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;
    let channel: RealtimeChannel | null = null;

    if (supabaseUrl && supabaseKey) {
      supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const channelId = `user-session-guard-${userId}-${Math.random().toString(36).slice(2, 9)}`;

      channel = supabaseInstance
        .channel(channelId)
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "users",
            filter: `id=eq.${userId}`,
          },
          () => {
            handleAccountRevocation("Your account has been deleted by an administrator.");
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "users",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new && (payload.new as { status?: string }).status === "suspended") {
              handleAccountRevocation("Your account has been suspended by an administrator.");
            }
          }
        )
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel && supabaseInstance) {
        supabaseInstance.removeChannel(channel);
      }
    };
  }, [isLoaded, isSignedIn, userId, signOut]);

  return null;
}
