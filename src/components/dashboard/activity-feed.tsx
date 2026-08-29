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

      return logs.slice(0, 5).map((l) => {
        const isFan = l.actuator_type === "fan";
        const isFogger = l.actuator_type === "fogger";
        const isSprinkler = l.actuator_type === "sprinkler";

        const initials = isFan ? "FN" : isFogger ? "FG" : isSprinkler ? "SP" : "EX";
        const avatarClass = isFan
          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
          : isFogger
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : isSprinkler
          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
          : "bg-amber-500/20 text-amber-400 border border-amber-500/30";

        const isActivated = l.action === "activated";

        return {
          id: l.id,
          name: l.actuator_name,
          initials,
          avatarClass,
          action: l.action,
          isActivated,
          reason: l.reason || `${l.action} in ${l.zone || "Fruiting Bay"}`,
          zone: l.zone || "Fruiting Bay",
          trigger: l.trigger?.toUpperCase() || "MANUAL",
          time: timeAgo(l.created_at),
        };
      });
    },
    refetchInterval: 4000,
  });

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-bold tracking-tight text-foreground">
            System Activity
          </CardTitle>
          <CardDescription className="text-[11px] font-medium text-muted-foreground/60">
            Real-time events from database telemetry (Latest 5).
          </CardDescription>
        </div>
        <Link href="/dashboard/actuator-logs">
          <Button
            variant="link"
            className="h-auto p-0 text-[10px] font-bold uppercase tracking-wider text-primary hover:opacity-80"
          >
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 space-y-3.5 py-1">
        {activities.length === 0 ? (
          <div className="h-[180px] w-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
            <History className="size-6 text-muted-foreground/30 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-foreground">No recent events logged</p>
            <p className="text-[11px] text-muted-foreground/60 max-w-xs mt-1">
              Events will appear as relay commands and automations trigger in the greenhouse.
            </p>
          </div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 group">
              <Avatar className="size-7 shrink-0 mt-0.5">
                <AvatarFallback
                  className={cn(
                    "text-[10px] font-bold",
                    a.avatarClass,
                  )}
                >
                  {a.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {a.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 font-medium capitalize",
                        a.isActivated
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-muted-foreground/20 bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {a.action}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 font-mono">
                    {a.time}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {a.reason}
                </p>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[9px] font-semibold text-muted-foreground/50 tracking-wider">
                    TRIGGER: {a.trigger}
                  </span>
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[9px] text-muted-foreground/50">
                    {a.zone}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter className="border-t border-border/40 justify-center py-3.5 mt-auto">
        <Link href="/dashboard/actuator-logs" className="w-full text-center">
          <Button
            variant="link"
            className="group h-auto p-0 text-[11px] font-semibold text-muted-foreground/70 hover:text-foreground transition-all"
          >
            <ArrowUpRight className="mr-1.5 size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            Open System Logs
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
