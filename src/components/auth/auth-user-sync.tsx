"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Invisible background component that automatically mirrors the logged-in
 * Clerk user into Supabase's public.users table via the server endpoint.
 */
export function AuthUserSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || hasSyncedRef.current) return;

    hasSyncedRef.current = true;

    async function triggerSync() {
      try {
        const res = await fetch("/api/sync-user", { method: "POST" });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("User sync response:", errData);
        }
      } catch (err) {
        console.warn("User sync notice:", err);
      }
    }

    triggerSync();
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
