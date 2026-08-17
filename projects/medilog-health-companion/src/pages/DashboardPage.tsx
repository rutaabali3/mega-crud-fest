import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Medication, DoseLog, SymptomEntry } from "@/types";
import { SEVERITY_LABELS } from "@/types";
import { isToday, parseISO, format, isBefore, addDays, subDays } from "@/utils/dateHelpers";
import { formatTime } from "@/utils/dateHelpers";
import { Check, SkipForward, TrendingUp, TrendingDown, Pill, AlertTriangle, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardPageProps {
  medications: Medication[];
  logs: DoseLog[];
  symptoms: SymptomEntry[];
  onMarkTaken: (id: string) => void;
  onMarkSkipped: (id: string) => void;
}

export default function DashboardPage({ medications, logs, symptoms, onMarkTaken, onMarkSkipped }: DashboardPageProps) {
  const { toast } = useToast();

  const todayLogs = useMemo(() =>
    logs.filter((l) => isToday(parseISO(l.scheduledTime)))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
    [logs]
  );

  const takenToday = todayLogs.filter((l) => l.status === "taken").length;
  const totalToday = todayLogs.length;

  const weekAdherence = useMemo(() => {
    const weekAgo = subDays(new Date(), 7);
    const weekLogs = logs.filter((l) => {
      const d = parseISO(l.scheduledTime);
      return isBefore(weekAgo, d) && (l.status === "taken" || l.status === "missed" || l.status === "skipped");
    });
    if (weekLogs.length === 0) return 0;
    const taken = weekLogs.filter((l) => l.status === "taken").length;
    return Math.round((taken / weekLogs.length) * 100);
  }, [logs]);

  const prevWeekAdherence = useMemo(() => {
    const twoWeeksAgo = subDays(new Date(), 14);
    const weekAgo = subDays(new Date(), 7);
    const prevLogs = logs.filter((l) => {
      const d = parseISO(l.scheduledTime);
      return isBefore(twoWeeksAgo, d) && isBefore(d, weekAgo) && (l.status === "taken" || l.status === "missed" || l.status === "skipped");
    });
    if (prevLogs.length === 0) return 0;
    return Math.round((prevLogs.filter((l) => l.status === "taken").length / prevLogs.length) * 100);
  }, [logs]);

  const activeMeds = medications.filter((m) => m.isActive);

  const refillAlerts = useMemo(() => {
    const now = new Date();
    return medications.filter((m) => {
      if (!m.isActive || !m.endDate) return false;
      const end = parseISO(m.endDate);
      const alertStart = new Date(end.getTime() - m.refillReminderDays * 86400000);
      return isBefore(alertStart, now) && isBefore(now, end);
    });
  }, [medications]);

  const recentSymptoms = useMemo(() =>
    [...symptoms].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3),
    [symptoms]
  );

  const handleTaken = (id: string, name: string) => {
    onMarkTaken(id);
    toast({ title: "✅ Dose marked taken", description: name });
  };

  const handleSkipped = (id: string, name: string) => {
    onMarkSkipped(id);
    toast({ title: "⏭ Dose skipped", description: name });
  };

  const getMed = (id: string) => medications.find((m) => m.id === id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{takenToday} / {totalToday}</p>
            <p className="text-xs text-muted-foreground">Doses taken today</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              {weekAdherence >= prevWeekAdherence ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className="text-2xl font-bold">{weekAdherence}%</p>
            <p className="text-xs text-muted-foreground">Weekly adherence</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{activeMeds.length}</p>
            <p className="text-xs text-muted-foreground">Active medications</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <p className="text-2xl font-bold">{refillAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming refills</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xl font-semibold">Today's Doses</h2>
          {todayLogs.length === 0 ? (
            <Card className="bg-card border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">No doses scheduled for today 🎉</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {todayLogs.map((log) => {
                const med = getMed(log.medicationId);
                if (!med) return null;
                const time = format(parseISO(log.scheduledTime), "h:mm a");
                const statusColors: Record<string, string> = {
                  taken: "bg-success/20 text-success border-success/30",
                  skipped: "bg-warning/20 text-warning border-warning/30",
                  missed: "bg-destructive/20 text-destructive border-destructive/30",
                  pending: "bg-muted text-muted-foreground border-border",
                };
                return (
                  <Card key={log.id} className={`bg-card border-border rounded-2xl transition-all duration-300 ${log.status === "missed" ? "border-destructive/40" : ""}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: med.color + "20" }}>
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: med.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage} • {time}</p>
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Refill Alerts */}
          {refillAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Refill Alerts</h2>
              {refillAlerts.map((med) => {
                const daysLeft = med.endDate ? Math.ceil((parseISO(med.endDate).getTime() - Date.now()) / 86400000) : 0;
                return (
                  <Card key={med.id} className="bg-card border-warning/30 rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: med.color }} />
                        <div>
                          <p className="text-sm font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{daysLeft} days left • {med.prescriber}</p>
                        </div>
                      </div>
                      <Badge className="mt-2 bg-warning/20 text-warning border-warning/30 text-[10px]">
                        Refill Reminder
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Recent Symptoms */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Recent Symptoms</h2>
            {recentSymptoms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No symptoms logged yet</p>
            ) : (
              recentSymptoms.map((s) => (
                <Card key={s.id} className="bg-card border-border rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{s.symptom}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(s.date), "MMM d")}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={`text-xs ${i <= s.severity ? "text-warning" : "text-muted"}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
