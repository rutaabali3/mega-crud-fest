import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Medication, DoseLog } from "@/types";
import {
  format, parseISO, addDays, subDays, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, addHours,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CalendarPageProps {
  medications: Medication[];
  logs: DoseLog[];
}

export default function CalendarPage({ medications, logs }: CalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [heatmapMode, setHeatmapMode] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const start = startOfWeek(firstDay, { weekStartsOn: 1 });
    const end = endOfWeek(lastDay, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  const getLogsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return logs.filter((l) => l.scheduledTime.startsWith(dateStr));
  };

  const getMed = (id: string) => medications.find((m) => m.id === id);

  const selectedDayLogs = selectedDay ? getLogsForDay(selectedDay) : [];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const statusColors: Record<string, string> = {
    taken: "bg-success/20 text-success border-success/30",
    skipped: "bg-warning/20 text-warning border-warning/30",
    missed: "bg-destructive/20 text-destructive border-destructive/30",
    pending: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Heatmap</Label>
          <Switch checked={heatmapMode} onCheckedChange={setHeatmapMode} />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <p className="text-lg font-semibold min-w-[180px] text-center">
          {format(currentMonth, "MMMM yyyy")}
        </p>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
        ))}
        {calendarDays.map((day) => {
          const dayLogs = getLogsForDay(day);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, new Date());
          const total = dayLogs.length;
          const taken = dayLogs.filter((l) => l.status === "taken").length;
          const missed = dayLogs.filter((l) => l.status === "missed").length;
          const adherence = total > 0 ? taken / total : 0;
          const missRate = total > 0 ? missed / total : 0;

          // Unique medication colors for dots
          const medColors = [...new Set(dayLogs.map((l) => getMed(l.medicationId)?.color).filter(Boolean))];

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`relative min-h-[72px] p-1.5 rounded-xl border transition-all duration-200 hover:border-primary/40 ${
                isToday ? "border-primary/60 bg-primary/5" : "border-border/50"
              } ${!isCurrentMonth ? "opacity-40" : ""}`}
              style={heatmapMode && total > 0 ? {
                backgroundColor: `hsla(350, 89%, 60%, ${missRate * 0.5})`,
              } : undefined}
            >
              <span className={`text-xs font-medium ${isToday ? "text-primary" : ""}`}>
                {format(day, "d")}
              </span>

              {!heatmapMode && total > 0 && (
                <>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {medColors.slice(0, 4).map((c, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c as string }} />
                    ))}
                  </div>
                  <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full transition-all" style={{ width: `${adherence * 100}%` }} />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-4 pt-2">
        {medications.filter((m) => m.isActive).map((m) => (
          <div key={m.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            {m.name}
          </div>
        ))}
      </div>

      {/* Day Detail Sheet */}
      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedDay && format(selectedDay, "EEEE, MMMM d, yyyy")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {selectedDayLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No doses scheduled</p>
            ) : (
              selectedDayLogs.map((log) => {
                const med = getMed(log.medicationId);
                if (!med) return null;
                return (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: med.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{med.name} {med.dosage}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(log.scheduledTime), "h:mm a")}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[log.status]}`}>
                      {log.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
