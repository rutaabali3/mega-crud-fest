import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { useWorkout } from "@/context/WorkoutContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Timer, X, GripVertical } from "lucide-react";
import { SessionExercise, WorkoutSession } from "@/types";
import { COMMON_EXERCISES } from "@/data/seedData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LogWorkout() {
  const { programs, sessions, setSessions, settings, startRestTimer } = useWorkout();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get("programId") || "custom";
  const dayIndex = parseInt(searchParams.get("dayIndex") || "0", 10);

  const [workoutTitle, setWorkoutTitle] = useState("Custom Workout");
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [finishNotes, setFinishNotes] = useState("");
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const startTime = useRef(Date.now());
  const timerRef = useRef<number | null>(null);

  // Init from program
  useEffect(() => {
    if (programId !== "custom") {
      const prog = programs.find((p) => p.id === programId);
      if (prog && prog.days[dayIndex]) {
        const day = prog.days[dayIndex];
        setWorkoutTitle(day.label);
        setExercises(
          day.exercises.map((ex) => ({
            exerciseId: ex.id,
            name: ex.name,
            sets: Array.from({ length: ex.sets }, (_, i) => ({
              setNumber: i + 1,
              weight: 0,
              reps: 0,
              completed: false,
            })),
          }))
        );
      }
    }
  }, [programId, dayIndex, programs]);

  // Timer
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const getPrevData = (exerciseName: string, setNum: number) => {
    for (let i = sessions.length - 1; i >= 0; i--) {
      const ex = sessions[i].exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (ex) {
        const s = ex.sets.find((s) => s.setNumber === setNum && s.completed);
        if (s) return `${s.weight}×${s.reps}`;
      }
    }
    return "–";
  };

  const updateSet = (exIdx: number, setIdx: number, field: string, value: any) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], [field]: value };
      next[exIdx] = ex;
      return next;
    });
  };

  const addSet = (exIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets.push({ setNumber: ex.sets.length + 1, weight: 0, reps: 0, completed: false });
      next[exIdx] = ex;
      return next;
    });
  };

  const removeSet = (exIdx: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      if (ex.sets.length > 1) ex.sets.pop();
      next[exIdx] = ex;
      return next;
    });
  };

  const removeExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const addExercise = () => {
    if (!newExName.trim()) return;
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: crypto.randomUUID(),
        name: newExName.trim(),
        sets: Array.from({ length: newExSets }, (_, i) => ({
          setNumber: i + 1, weight: 0, reps: 0, completed: false,
        })),
      },
    ]);
    setNewExName("");
    setNewExSets(3);
    setShowAddExercise(false);
  };

  const handleSetCompleted = (exIdx: number, setIdx: number, checked: boolean) => {
    updateSet(exIdx, setIdx, "completed", checked);
    if (checked) startRestTimer(settings.defaultRestSeconds);
  };

  const handleFinish = () => {
    const totalSets = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.completed).length, 0);
    const totalVol = exercises.reduce((a, ex) => a + ex.sets.reduce((sa, s) => sa + (s.completed ? s.weight * s.reps : 0), 0), 0);

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      programId,
      programName: programId !== "custom" ? programs.find((p) => p.id === programId)?.name || "Custom" : "Custom",
      dayLabel: workoutTitle,
      date: new Date().toISOString(),
      durationMinutes: Math.round(elapsed / 60),
      exercises,
      notes: finishNotes,
    };

    setSessions([...sessions, session]);
    navigate("/");
  };

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const totalVolume = exercises.reduce((a, ex) => a + ex.sets.reduce((sa, s) => sa + (s.completed ? s.weight * s.reps : 0), 0), 0);
  const totalCompletedSets = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.completed).length, 0);

  const handleNameInput = (val: string) => {
    setNewExName(val);
    if (val.length > 0) {
      setSuggestions(COMMON_EXERCISES.filter((e) => e.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div>
      <TopBar title="Log Workout" />

      {/* Workout header */}
      <div className="flex items-center justify-between mb-4 p-4 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-4">
          <Input
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            className="bg-transparent border-none text-lg font-bold text-foreground p-0 h-auto focus-visible:ring-0 max-w-[200px]"
          />
          <div className="text-xl font-mono font-bold text-primary">
            {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-muted-foreground" onClick={() => setShowCancel(true)}>Cancel</Button>
          <Button onClick={() => setShowFinish(true)} className="rounded-full font-bold">Finish Workout</Button>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => (
          <Card key={ex.exerciseId} className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <h3 className="font-bold text-foreground">{ex.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startRestTimer(settings.defaultRestSeconds)}>
                    <Timer className="h-4 w-4 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeExercise(exIdx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 text-xs text-muted-foreground font-semibold mb-1 px-1">
                <span>SET</span><span>PREV</span><span>KG</span><span>REPS</span><span>✓</span>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div
                  key={setIdx}
                  className={`grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 items-center py-1.5 px-1 rounded transition-colors ${
                    set.completed ? "bg-success/10" : ""
                  }`}
                >
                  <span className="text-sm font-semibold text-muted-foreground">{set.setNumber}</span>
                  <span className="text-sm text-muted-foreground">{getPrevData(ex.name, set.setNumber)}</span>
                  <Input
                    type="number"
                    min={0}
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)}
                    className="h-8 bg-input border-border text-foreground text-sm"
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)}
                    className="h-8 bg-input border-border text-foreground text-sm"
                    placeholder="0"
                  />
                  <Checkbox
                    checked={set.completed}
                    onCheckedChange={(checked) => handleSetCompleted(exIdx, setIdx, !!checked)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => addSet(exIdx)}>
                  <Plus className="h-3 w-3 mr-1" /> Set
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => removeSet(exIdx)}>
                  <Minus className="h-3 w-3 mr-1" /> Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => setShowAddExercise(true)}
        className="w-full mt-4 border-dashed border-border text-muted-foreground"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Exercise
      </Button>

      {/* Add Exercise Modal */}
      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 relative">
            <Input
              placeholder="Exercise name"
              value={newExName}
              onChange={(e) => handleNameInput(e.target.value)}
              className="bg-input border-border"
            />
            {suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setNewExName(s); setSuggestions([]); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sets:</span>
              <Input
                type="number"
                min={1}
                max={10}
                value={newExSets}
                onChange={(e) => setNewExSets(parseInt(e.target.value) || 3)}
                className="w-20 bg-input border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddExercise(false)}>Cancel</Button>
            <Button onClick={addExercise} disabled={!newExName.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish Modal */}
      <Dialog open={showFinish} onOpenChange={setShowFinish}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Workout Summary</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-foreground">{mins}:{secs.toString().padStart(2, "0")}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-foreground">{exercises.length}</p>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-foreground">{totalCompletedSets}</p>
              <p className="text-xs text-muted-foreground">Sets</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-2xl font-bold text-primary">{totalVolume.toLocaleString()} kg</p>
              <p className="text-xs text-muted-foreground">Volume</p>
            </div>
          </div>
          <Textarea
            placeholder="Workout notes (optional)"
            value={finishNotes}
            onChange={(e) => setFinishNotes(e.target.value)}
            className="bg-input border-border"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowFinish(false)}>Discard</Button>
            <Button onClick={handleFinish} className="font-bold">Save Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
            <AlertDialogDescription>Your current workout progress will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Going</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/")} className="bg-destructive text-destructive-foreground">Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
