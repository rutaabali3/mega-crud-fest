import { useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { useStreaklyData } from "@/hooks/useStreaklyData";
import { Habit } from "@/types/habit";
import { getCurrentStreak, getLongestStreak, isCompletedToday, getTodayStr, getCompletionsForYear } from "@/lib/streaks";
import { HabitCard } from "@/components/HabitCard";
import { HabitModal } from "@/components/HabitModal";
import { Heatmap } from "@/components/Heatmap";
import { QuoteCard } from "@/components/QuoteCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Download, Upload, Flame, Trophy, CalendarDays, ArchiveRestore, Trash2, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const {
    data, addHabit, updateHabit, archiveHabit,
    restoreHabit, deleteHabit, toggleCompletion,
    importData, exportData,
  } = useStreaklyData();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    () => localStorage.getItem("streakly-onboarded") === "true"
  );

  const selected = data.habits.find(h => h.id === selectedId) || data.habits[0] || null;

  const handleMarkToday = useCallback(() => {
    if (!selected) return;
    const today = getTodayStr();
    if (isCompletedToday(selected)) {
      toggleCompletion(selected.id, today);
      toast({ title: "Unmarked today", description: "Completion removed." });
      return;
    }
    toggleCompletion(selected.id, today);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    toast({ title: "🎉 Great job!", description: `"${selected.name}" marked complete for today!` });
  }, [selected, toggleCompletion]);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "streakly-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "Data saved as JSON." });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed.habits && parsed.archivedHabits) {
          importData(parsed);
          toast({ title: "Imported!", description: "Data restored successfully." });
        } else {
          toast({ title: "Invalid file", description: "Not a valid Streakly backup.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Failed to parse file.", variant: "destructive" });
      }
    };
    input.click();
  };

  const dismissOnboarding = () => {
    setHasSeenOnboarding(true);
    localStorage.setItem("streakly-onboarded", "true");
  };

  const todayDone = selected ? isCompletedToday(selected) : false;
  const streak = selected ? getCurrentStreak(selected) : 0;
  const longest = selected ? getLongestStreak(selected) : 0;
  const yearCount = selected ? getCompletionsForYear(selected) : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border shadow-sm"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-card border-r flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-card-foreground">Streakly</h1>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Build habits that stick</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {data.habits.length === 0 && !showArchived && (
            <div className="text-center py-8 px-4">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm text-muted-foreground mb-4">No habits yet. Start building your streak!</p>
            </div>
          )}

          {data.habits.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              isActive={selected?.id === h.id}
              onClick={() => { setSelectedId(h.id); setShowArchived(false); }}
              onEdit={() => { setEditHabit(h); setModalOpen(true); }}
              onArchive={() => {
                archiveHabit(h.id);
                toast({ title: "Archived", description: `"${h.name}" moved to archive.` });
              }}
            />
          ))}

          {/* Archived section */}
          {data.archivedHabits.length > 0 && (
            <div className="pt-4 mt-4 border-t">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="text-xs text-muted-foreground hover:text-card-foreground transition-colors w-full text-left font-medium mb-2"
              >
                📦 Archived ({data.archivedHabits.length}) {showArchived ? "▾" : "▸"}
              </button>
              {showArchived && data.archivedHabits.map(h => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full opacity-50" style={{ backgroundColor: h.color }} />
                    <span className="text-muted-foreground">{h.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                      restoreHabit(h.id);
                      toast({ title: "Restored", description: `"${h.name}" is back!` });
                    }}>
                      <ArchiveRestore className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                      deleteHabit(h.id);
                      toast({ title: "Deleted", description: `"${h.name}" permanently removed.` });
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t space-y-2">
          <Button onClick={() => { setEditHabit(null); setModalOpen(true); dismissOnboarding(); }} className="w-full gap-2" size="sm">
            <Plus className="w-4 h-4" /> New Habit
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={handleExport}>
              <Download className="w-3 h-3" /> Export
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={handleImport}>
              <Upload className="w-3 h-3" /> Import
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 pt-16 lg:pt-8">
        {!selected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">Welcome to Streakly</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Track your habits, build streaks, and become the best version of yourself.
            </p>
            <Button onClick={() => { setEditHabit(null); setModalOpen(true); dismissOnboarding(); }} size="lg" className="gap-2">
              <Plus className="w-5 h-5" /> Create Your First Habit
            </Button>

            {!hasSeenOnboarding && (
              <div className="mt-8 p-4 rounded-xl bg-card border max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-sm text-muted-foreground">
                  💡 <strong className="text-card-foreground">Tip:</strong> Start with just one small habit.
                  Consistency beats intensity every time.
                </p>
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={dismissOnboarding}>
                  Got it!
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with mark complete */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selected.color }} />
                  <h2 className="text-2xl font-bold text-card-foreground">{selected.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1 capitalize">{selected.frequency} habit · {selected.targetStreak}-day target</p>
              </div>
              <Button
                onClick={handleMarkToday}
                size="lg"
                style={todayDone ? { backgroundColor: "hsl(142, 71%, 45%)", color: "white" } : {}}
                className="gap-2 transition-all text-base font-semibold px-6 shadow-md"
              >
                {todayDone ? (
                  <><span className="text-lg">✓</span> Completed Today</>
                ) : (
                  <><span className="text-lg">○</span> Mark Today as Complete</>
                )}
              </Button>
            </div>

            {/* Streak stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-card border p-4 text-center">
                <Flame className="w-6 h-6 mx-auto mb-1" style={{ color: streak > 0 ? "#f97316" : undefined }} />
                <div className="text-3xl font-bold font-mono text-card-foreground">{streak}</div>
                <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
              </div>
              <div className="rounded-xl bg-card border p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                <div className="text-3xl font-bold font-mono text-card-foreground">{longest}</div>
                <p className="text-xs text-muted-foreground mt-1">Longest Streak</p>
              </div>
              <div className="rounded-xl bg-card border p-4 text-center">
                <CalendarDays className="w-6 h-6 mx-auto mb-1 text-primary" />
                <div className="text-3xl font-bold font-mono text-card-foreground">{yearCount}</div>
                <p className="text-xs text-muted-foreground mt-1">This Year</p>
              </div>
            </div>

            {/* Streak break encouragement */}
            {streak === 0 && selected.completions.length > 0 && (
              <div className="rounded-xl bg-card border p-4 text-center animate-in fade-in duration-500">
                <p className="text-sm">
                  💪 <span className="text-card-foreground font-medium">Don't worry!</span>{" "}
                  <span className="text-muted-foreground">Every expert was once a beginner. Start a new streak today!</span>
                </p>
              </div>
            )}

            {/* Heatmap */}
            <div className="rounded-xl bg-card border p-5">
              <h3 className="text-sm font-semibold text-card-foreground mb-4">Contribution Heatmap</h3>
              <Heatmap habit={selected} />
            </div>

            {/* Quote */}
            <QuoteCard />
          </div>
        )}
      </main>

      <HabitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editHabit={editHabit}
        onSave={(habit) => {
          if (editHabit) {
            updateHabit(habit);
            toast({ title: "Updated!", description: `"${habit.name}" saved.` });
          } else {
            addHabit(habit);
            setSelectedId(habit.id);
            toast({ title: "Created!", description: `"${habit.name}" is ready to track!` });
          }
        }}
      />
    </div>
  );
};

export default Index;
