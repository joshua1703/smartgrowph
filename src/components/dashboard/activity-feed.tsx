"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { ArrowUpRight, History } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ className }: { className?: string }) {
  const { data: activities = [] } = useQuery({
    queryKey: ["dashboard-activity-feed"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      const { data: logs } = await supabase
        .from("actuator_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!logs || logs.length === 0) return [];

      return logs.map((l) => {
        const isFan = l.actuator_type === "fan";
        const isFogger = l.actuator_type === "fogger";
        const isSprinkler = l.actuator_type === "sprinkler";

        const initials = isFan ? "FN" : isFogger ? "FG" : isSprinkler ? "SP" : "LD";
        const avatarClass = isFan
          ? "bg-emerald-600"
          : isFogger
          ? "bg-sky-600"
          : isSprinkler
          ? "bg-purple-600"
          : "bg-amber-600";

        return {
          id: l.id,
          name: l.actuator_name,
          initials,
          avatarClass,
          action: `${l.action.charAt(0).toUpperCase() + l.action.slice(1)} —`,
          highlight: `${l.reason} in ${l.zone}`,
          location: `Trigger: ${l.trigger.toUpperCase()}`,
          time: timeAgo(l.created_at),
          badge: l.action === "error" ? "Error Alert" : l.trigger === "auto" ? "Automated" : "Manual",
        };
      });
    },
    refetchInterval: 4000,
  });

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">
            System Activity
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground/40">
            Real-time events from database telemetry.
          </CardDescription>
        </div>
        <Link href="/dashboard/actuator-logs">
          <Button
            variant="link"
            className="h-auto p-0 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-opacity hover:opacity-80"
          >
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 py-2">
        {activities.length === 0 ? (
          <div className="h-[180px] w-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <History className="size-7 text-muted-foreground/30 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-foreground">No recent events logged</p>
            <p className="text-[11px] text-muted-foreground/60 max-w-xs mt-1">
              Events will appear as relay commands and sensors log activity to the database.
            </p>
          </div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex gap-3">
              <Avatar className="size-10 shrink-0 border border-white/5 ring-1 ring-white/5">
                <AvatarFallback
                  className={cn(
                    "text-[12px] font-bold text-white",
                    a.avatarClass,
                  )}
                >
                  {a.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground truncate">
                    {a.name}
                  </p>
                  <span className="text-[10px] font-medium text-muted-foreground/50 shrink-0 ml-4">
                    {a.time}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-muted-foreground/80 leading-snug">
                  {a.action}{" "}
                  <span className="font-bold text-primary">
                    {a.highlight}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  <span className="inline-flex items-center rounded-full bg-muted/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                    {a.location}
                  </span>
                  {a.badge && (
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/5 text-[9px] font-black uppercase tracking-wider text-primary px-1.5 py-0"
                    >
                      {a.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="border-t border-border/50 justify-center py-6">
        <Link href="/dashboard/actuator-logs" className="w-full text-center">
          <Button
            variant="link"
            className="group h-auto p-0 text-xs font-bold text-muted-foreground/60 hover:text-foreground transition-all"
          >
            <ArrowUpRight className="mr-2 size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            Open System Logs
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
