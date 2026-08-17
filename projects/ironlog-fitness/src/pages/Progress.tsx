import { useState, useMemo } from "react";
import { TopBar } from "@/components/TopBar";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Trash2, Download, Upload, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, startOfWeek, subWeeks } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SessionDetailModal } from "@/components/SessionDetailModal";
import { WorkoutSession, PersonalRecord } from "@/types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Progress() {
  const { sessions, setSessions, programs, setPrograms, measurements, setMeasurements } = useWorkout();
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [viewSession, setViewSession] = useState<WorkoutSession | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [prSearch, setPrSearch] = useState("");
  const PAGE_SIZE = 10;

  // All exercise names
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)));
    return Array.from(names).sort();
  }, [sessions]);

  // Volume chart data for selected exercise
  const volumeData = useMemo(() => {
    if (!selectedExercise) return [];
    return sessions
      .filter((s) => s.exercises.some((e) => e.name === selectedExercise))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((s) => {
        const ex = s.exercises.find((e) => e.name === selectedExercise)!;
        const vol = ex.sets.reduce((a, set) => a + (set.completed ? set.weight * set.reps : 0), 0);
        return { date: format(parseISO(s.date), "MMM d"), volume: vol };
      });
  }, [sessions, selectedExercise]);

  // Weekly volume bar chart
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      const vol = sessions
        .filter((s) => { try { const d = parseISO(s.date); return d >= ws && d <= we; } catch { return false; } })
        .reduce((a, s) => a + s.exercises.reduce((ea, ex) => ea + ex.sets.reduce((sa, set) => sa + (set.completed ? set.weight * set.reps : 0), 0), 0), 0);
      weeks.push({ week: format(ws, "MMM d"), volume: vol });
    }
    return weeks;
  }, [sessions]);

  // PRs
  const prs = useMemo(() => {
    const map: Record<string, PersonalRecord & { sessionsCount: number }> = {};
    sessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        const key = ex.name.toLowerCase();
        if (!map[key]) map[key] = { exerciseName: ex.name, weight: 0, reps: 0, date: "", sessionsCount: 0 };
        map[key].sessionsCount++;
        ex.sets.forEach((set) => {
          if (set.completed && set.weight > map[key].weight) {
            map[key].weight = set.weight;
            map[key].reps = set.reps;
            map[key].date = s.date;
          }
        });
      });
    });
    return Object.values(map).filter((pr) => pr.weight > 0);
  }, [sessions]);

  const filteredPrs = prs.filter((pr) => pr.exerciseName.toLowerCase().includes(prSearch.toLowerCase()));

  // Session history
  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [sessions]);
  const filteredSessions = sortedSessions.filter((s) =>
    s.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.dayLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.date.includes(searchQuery)
  );
  const pagedSessions = filteredSessions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredSessions.length / PAGE_SIZE);

  const handleExport = () => {
    try {
      const data = {
        ironlog_programs: programs,
        ironlog_sessions: sessions,
        ironlog_measurements: measurements,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ironlog-export-${format(new Date(), "yyyy-MM-dd")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.ironlog_programs) setPrograms(data.ironlog_programs);
        if (data.ironlog_sessions) setSessions(data.ironlog_sessions);
        if (data.ironlog_measurements) setMeasurements(data.ironlog_measurements);
      } catch {}
    };
    reader.readAsText(file);
  };

  const handleDelete = () => {
    if (deleteId) {
      setSessions(sessions.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div>
      <TopBar title="Progress" />

      {/* Export/Import */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <label>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <span><Upload className="h-4 w-4" /> Import</span>
          </Button>
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </div>

      {/* Exercise Volume Chart */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Exercise Volume</CardTitle>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-48 bg-input border-border">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {exerciseNames.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>{selectedExercise ? "No data for this exercise yet" : "Select an exercise to see volume trends"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Volume */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Volume (Last 8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.some((w) => w.volume > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>Log workouts to see weekly volume trends</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PRs Table */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Personal Records</CardTitle>
            <Input
              placeholder="Search..."
              value={prSearch}
              onChange={(e) => setPrSearch(e.target.value)}
              className="w-48 h-8 bg-input border-border text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPrs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left py-2">Exercise</th>
                    <th className="text-left py-2">Best Weight</th>
                    <th className="text-left py-2">Reps</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrs.map((pr) => (
                    <tr key={pr.exerciseName} className="border-b border-border/50">
                      <td className="py-2 font-semibold text-foreground">{pr.exerciseName}</td>
                      <td className="py-2 text-primary font-bold">{pr.weight} kg</td>
                      <td className="py-2">{pr.reps}</td>
                      <td className="py-2 text-muted-foreground">{pr.date ? format(parseISO(pr.date), "MMM d, yyyy") : "–"}</td>
                      <td className="py-2 text-muted-foreground">{pr.sessionsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No records yet</p>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Session History</CardTitle>
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="w-48 h-8 bg-input border-border text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {pagedSessions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b border-border">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Program</th>
                      <th className="text-left py-2">Day</th>
                      <th className="text-left py-2">Exercises</th>
                      <th className="text-left py-2">Volume</th>
                      <th className="text-left py-2">Duration</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedSessions.map((s) => {
                      const vol = s.exercises.reduce((a, ex) => a + ex.sets.reduce((sa, set) => sa + (set.completed ? set.weight * set.reps : 0), 0), 0);
                      return (
                        <tr key={s.id} className="border-b border-border/50">
                          <td className="py-2 text-foreground">{format(parseISO(s.date), "MMM d")}</td>
                          <td className="py-2 text-muted-foreground">{s.programName}</td>
                          <td className="py-2">{s.dayLabel}</td>
                          <td className="py-2">{s.exercises.length}</td>
                          <td className="py-2">{vol.toLocaleString()} kg</td>
                          <td className="py-2">{s.durationMinutes}m</td>
                          <td className="py-2 text-right">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewSession(s)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(s.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Button size="icon" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
                  <Button size="icon" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No sessions logged yet</p>
          )}
        </CardContent>
      </Card>

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
