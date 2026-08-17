import { TopBar } from "@/components/TopBar";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Dumbbell, Flame, CalendarDays, Eye, Trash2 } from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInCalendarDays, subDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SessionDetailModal } from "@/components/SessionDetailModal";
import { WorkoutSession, PersonalRecord } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { sessions, setSessions } = useWorkout();
  const [viewSession, setViewSession] = useState<WorkoutSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const weekSessions = sessions.filter((s) => {
    try {
      const d = parseISO(s.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch { return false; }
  });

  const weekVolume = weekSessions.reduce((acc, s) => {
    return acc + s.exercises.reduce((ea, ex) =>
      ea + ex.sets.reduce((sa, set) =>
        sa + (set.completed ? set.weight * set.reps : 0), 0), 0);
  }, 0);

  // Streak
  const streak = (() => {
    let count = 0;
    let day = now;
    const sessionDates = sessions.map((s) => s.date);
    for (let i = 0; i < 365; i++) {
      const checkDay = subDays(day, i);
      if (sessionDates.some((d) => { try { return isSameDay(parseISO(d), checkDay); } catch { return false; } })) {
        count++;
      } else if (i > 0) break;
    }
    return count;
  })();

  // PRs
  const prs: PersonalRecord[] = (() => {
    const map: Record<string, PersonalRecord> = {};
    sessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.completed && set.weight > 0) {
            const key = ex.name.toLowerCase();
            if (!map[key] || set.weight > map[key].weight) {
              map[key] = { exerciseName: ex.name, weight: set.weight, reps: set.reps, date: s.date };
            }
          }
        });
      });
    });
    return Object.values(map).sort((a, b) => b.weight - a.weight).slice(0, 6);
  })();

  // Weekly grid
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const recentSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const handleDelete = () => {
    if (deleteId) {
      setSessions(sessions.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    }
  };

  const stats = [
    { label: "Total Workouts", value: sessions.length, icon: Dumbbell },
    { label: "This Week", value: weekSessions.length, icon: CalendarDays },
    { label: "Weekly Volume", value: `${weekVolume.toLocaleString()} kg`, icon: Flame },
    { label: "Streak", value: `${streak} day${streak !== 1 ? "s" : ""}`, icon: Trophy },
  ];

  return (
    <div>
      <TopBar title="Dashboard" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Grid */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              const isToday = isSameDay(d, now);
              const daySessions = sessions.filter((s) => { try { return isSameDay(parseISO(s.date), d); } catch { return false; } });
              return (
                <div
                  key={i}
                  className={`text-center p-2 rounded-lg border transition-colors ${
                    isToday ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <p className="text-xs text-muted-foreground font-semibold">{format(d, "EEE")}</p>
                  <p className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{format(d, "d")}</p>
                  {daySessions.length > 0 && (
                    <div className="mt-1 flex flex-col gap-1">
                      {daySessions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setViewSession(s)}
                          className="text-[10px] bg-primary/20 text-primary rounded px-1 py-0.5 truncate hover:bg-primary/30 transition-colors"
                        >
                          {s.dayLabel}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No sessions logged yet. Start your first workout!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => {
                const vol = s.exercises.reduce((a, ex) => a + ex.sets.reduce((sa, set) => sa + (set.completed ? set.weight * set.reps : 0), 0), 0);
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{s.dayLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(s.date), "EEE, MMM d")} · {s.exercises.length} exercises · {vol.toLocaleString()} kg · {s.durationMinutes}min
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewSession(s)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRs */}
      {prs.length > 0 && (
        <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {prs.map((pr) => (
                <div key={pr.exerciseName} className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="font-bold text-sm text-foreground">{pr.exerciseName}</p>
                  <p className="text-lg font-extrabold text-primary">{pr.weight} kg</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(pr.date), "MMM d, yyyy")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewSession && <SessionDetailModal session={viewSession} onClose={() => setViewSession(null)} />}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
