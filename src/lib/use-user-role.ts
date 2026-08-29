"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database, UserRole } from "@/lib/supabase/types";

export interface UserPermissions {
  role: UserRole;
  canManageUsers: boolean;
  canEditSettings: boolean;
  canControlDevices: boolean;
  canManageBatches: boolean;
  canManageSchedules: boolean;
  isViewer: boolean;
  isAdmin: boolean;
}

export function useUserRole(): UserPermissions & { isLoading: boolean } {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();

  const { data: role = "viewer", isLoading } = useQuery<UserRole>({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return "viewer";

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) {
        return user?.primaryEmailAddress?.emailAddress === "eala.joshuamark@gmail.com"
          ? "admin"
          : "viewer";
      }

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !data?.role) {
        return user?.primaryEmailAddress?.emailAddress === "eala.joshuamark@gmail.com"
          ? "admin"
          : "viewer";
      }

      return data.role;
    },
    enabled: isLoaded && !!user?.id && typeof window !== "undefined",
    refetchInterval: 3000,
  });

  // Supabase Realtime subscription with unique channel identifier per instance
  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
    const channelId = `user-role-sync-${user.id}-${Math.random().toString(36).slice(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-role", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const isAdmin = role === "admin";
  const isOperator = role === "operator";
  const isTechnician = role === "technician";
  const isViewer = role === "viewer";

  return {
    role,
    isLoading,
    isAdmin,
    isViewer,
    canManageUsers: isAdmin,
    canEditSettings: isAdmin,
    canControlDevices: isAdmin || isOperator || isTechnician,
    canManageBatches: isAdmin || isOperator,
    canManageSchedules: isAdmin || isTechnician,
  };
}
