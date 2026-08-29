"use client";

import { useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@clerk/nextjs";
import type { Database } from "./types";

/**
 * Creates a standard Supabase browser client with optional Clerk JWT authorization header.
 */
export function createClient(clerkToken?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: clerkToken
        ? {
            Authorization: `Bearer ${clerkToken}`,
          }
        : undefined,
    },
  });
}

/**
 * React hook to get a Supabase client automatically authorized with the active Clerk user session.
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  return useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          try {
            // Retrieve JWT token from Clerk (uses 'supabase' template if configured, otherwise default session token)
            const token =
              (await getToken({ template: "supabase" }).catch(() => null)) ||
              (await getToken().catch(() => null));

            const headers = new Headers(options.headers);
            if (token) {
              headers.set("Authorization", `Bearer ${token}`);
            }

            return fetch(url, {
              ...options,
              headers,
            });
          } catch {
            return fetch(url, options);
          }
        },
      },
    });
  }, [getToken]);
}
