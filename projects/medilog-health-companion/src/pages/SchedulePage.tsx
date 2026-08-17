import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Medication, DoseLog } from "@/types";
import { format, parseISO, addDays, subDays, toISODate } from "@/utils/dateHelpers";
import { ChevronLeft, ChevronRight, Check, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchedulePageProps {
  medications: Medication[];
  logs: DoseLog[];
  onMarkTaken: (id: string, notes?: string) => void;
  onMarkSkipped: (id: string, notes?: string) => void;
}

export default function SchedulePage({ medications, logs, onMarkTaken, onMarkSkipped }: SchedulePageProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [showNote, setShowNote] = useState<string | null>(null);

  const dateStr = toISODate(selectedDate);

  const dayLogs = useMemo(() => {
    return logs
      .filter((l) => l.scheduledTime.startsWith(dateStr))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [logs, dateStr]);

  const getMed = (id: string) => medications.find((m) => m.id === id);

  const handleTaken = (logId: string, medName: string) => {
    onMarkTaken(logId, noteInputs[logId]);
    toast({ title: "✅ Dose marked taken", description: medName });
    setShowNote(null);
  };

  const handleSkipped = (logId: string, medName: string) => {
    onMarkSkipped(logId, noteInputs[logId]);
    toast({ title: "⏭ Dose skipped", description: medName });
    setShowNote(null);
  };

  const statusColors: Record<string, string> = {
    taken: "bg-success/20 text-success border-success/30",
    skipped: "bg-warning/20 text-warning border-warning/30",
    missed: "bg-destructive/20 text-destructive border-destructive/30",
    pending: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center min-w-[200px]">
          <p className="text-lg font-semibold">{format(selectedDate, "EEEE")}</p>
          <p className="text-sm text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>Today</Button>
      </div>

      {/* Dose List */}
      {dayLogs.length === 0 ? (
        <Card className="bg-card border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No doses scheduled for this day</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayLogs.map((log) => {
            const med = getMed(log.medicationId);
            if (!med) return null;
            const time = format(parseISO(log.scheduledTime), "h:mm a");
            return (
              <Card key={log.id} className={`bg-card border-border rounded-2xl transition-all duration-300 ${log.status === "missed" ? "border-destructive/40" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-muted-foreground w-16 shrink-0">{time}</div>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: med.color + "20" }}>
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: med.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage} • {med.pillsPerDose} pill{med.pillsPerDose > 1 ? "s" : ""}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[log.status]}`}>
                      {log.status}
                    </Badge>
                    {log.status === "pending" && (
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleTaken(log.id, med.name)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => handleSkipped(log.id, med.name)}>
                          <SkipForward className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {log.status === "taken" && log.takenAt && (
                    <p className="text-[10px] text-success mt-2 ml-20">Taken at {format(parseISO(log.takenAt), "h:mm a")}</p>
                  )}
                  {log.notes && (
                    <p className="text-xs text-muted-foreground mt-1 ml-20 italic">Note: {log.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
