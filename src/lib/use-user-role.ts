"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  const [role, setRole] = useState<UserRole>("viewer");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) {
      if (isLoaded) setIsLoading(false);
      return;
    }

    async function fetchRole() {
      try {
        const supabase = createBrowserClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
        );

        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user!.id)
          .single();

        if (data?.role) {
          setRole(data.role);
        } else if (user?.primaryEmailAddress?.emailAddress === "eala.joshuamark@gmail.com") {
          setRole("admin");
        } else {
          setRole("viewer");
        }
      } catch {
        setRole("viewer");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [user, isLoaded]);

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
