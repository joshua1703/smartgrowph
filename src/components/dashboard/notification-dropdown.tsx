"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { Bell, CheckCircle2, AlertTriangle, Cpu, Clock, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "auto" | "schedule" | "manual" | "alert";
  isRead: boolean;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ["header-notifications"],
    queryFn: async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return [];

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // Fetch from system_logs
      const { data: sysLogs } = await (supabase as any)
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch from actuator_logs
      const { data: actLogs } = await supabase
        .from("actuator_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      const items: NotificationItem[] = [];

      if (sysLogs && Array.isArray(sysLogs)) {
        sysLogs.forEach((s: any) => {
          let type: NotificationItem["type"] = "manual";
          if (s.category === "alert" || s.severity === "critical" || s.severity === "warning") type = "alert";
          else if (s.category === "automation") type = "auto";
          else if (s.category === "schedule") type = "schedule";

          items.push({
            id: s.id,
            title: `${s.action} — ${s.source}`,
            description: s.message || s.details || "System action logged",
            time: timeAgo(s.created_at),
            type,
            isRead: readIds.has(s.id),
          });
        });
      }

      if (actLogs && Array.isArray(actLogs)) {
        actLogs.forEach((log) => {
          if (!items.some((i) => i.id === log.id)) {
            const isAuto = log.trigger === "auto";
            const isSchedule = log.trigger === "schedule";
            const isAlert = log.reason?.toLowerCase().includes("threshold") || log.action === "error";

            let type: NotificationItem["type"] = "manual";
            if (isAlert) type = "alert";
            else if (isAuto) type = "auto";
            else if (isSchedule) type = "schedule";

            items.push({
              id: log.id,
              title: `${log.actuator_name} — ${log.action.toUpperCase()}`,
              description: log.reason || `${log.action} in ${log.zone}`,
              time: timeAgo(log.created_at),
              type,
              isRead: readIds.has(log.id),
            });
          }
        });
      }

      return items.slice(0, 10);
    },
    refetchInterval: 5000,
  });

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    queryClient.invalidateQueries({ queryKey: ["header-notifications"] });
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="size-3.5 text-amber-500" />;
      case "auto":
        return <Cpu className="size-3.5 text-primary" />;
      case "schedule":
        return <Clock className="size-3.5 text-sky-400" />;
      default:
        return <CheckCircle2 className="size-3.5 text-emerald-400" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label="System Notifications"
        >
          <span className="relative inline-flex items-center justify-center">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center shadow-sm leading-none font-mono pointer-events-none ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[340px] sm:w-[380px] p-0 shadow-xl border-border bg-card text-card-foreground"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-bold bg-primary/10 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Check className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[320px] overflow-y-auto divide-y divide-border/30">
          {notifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="size-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">No notifications</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                System events and sensor alerts will show up here.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors hover:bg-muted/30",
                    isUnread && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 size-6 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <div className="p-2 border-t border-border/50 bg-muted/10 text-center">
          <Link href="/dashboard/system-logs" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-primary hover:text-primary gap-1.5 h-8">
              View All System Logs
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
