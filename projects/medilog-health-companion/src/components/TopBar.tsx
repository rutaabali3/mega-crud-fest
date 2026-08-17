import { Bell } from "lucide-react";
import { format } from "date-fns";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Medication, DoseLog } from "@/types";
import { useNotifications } from "@/hooks/useNotifications";

interface TopBarProps {
  medications: Medication[];
  logs: DoseLog[];
}

export function TopBar({ medications, logs }: TopBarProps) {
  const { badgeCount, pendingToday, refillAlerts } = useNotifications(medications, logs);

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden sm:block">
          <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            {badgeCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">
                {badgeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <h4 className="font-semibold text-sm mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Notifications
          </h4>
          {badgeCount === 0 ? (
            <p className="text-xs text-muted-foreground">All caught up! ✨</p>
          ) : (
            <div className="space-y-2">
              {pendingToday > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  <span>{pendingToday} pending dose{pendingToday > 1 ? "s" : ""} today</span>
                </div>
              )}
              {refillAlerts.map((med) => (
                <div key={med.id} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  <span>{med.name} — refill soon</span>
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </header>
  );
}
