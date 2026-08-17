import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Program, ProgramDay, ProgramExercise } from "@/types";
import { COMMON_EXERCISES } from "@/data/seedData";

interface Props {
  program: Program | null;
  onSave: (program: Program) => void;
  onClose: () => void;
}

export function ProgramModal({ program, onSave, onClose }: Props) {
  const [name, setName] = useState(program?.name || "");
  const [daysPerWeek, setDaysPerWeek] = useState(program?.daysPerWeek || 3);
  const [days, setDays] = useState<ProgramDay[]>(
    program?.days || Array.from({ length: 3 }, (_, i) => ({
      dayIndex: i,
      label: `Day ${i + 1}`,
      exercises: [],
    }))
  );
  const [nameError, setNameError] = useState(false);

  const updateDaysCount = (count: number) => {
    setDaysPerWeek(count);
    setDays((prev) => {
      if (count > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: count - prev.length }, (_, i) => ({
            dayIndex: prev.length + i,
            label: `Day ${prev.length + i + 1}`,
            exercises: [],
          })),
        ];
      }
      return prev.slice(0, count);
    });
  };

  const addExercise = (dayIdx: number) => {
    setDays((prev) => {
      const next = [...prev];
      next[dayIdx] = {
        ...next[dayIdx],
        exercises: [
          ...next[dayIdx].exercises,
          { id: crypto.randomUUID(), name: "", sets: 3, reps: "8-12", restSeconds: 90, notes: "" },
        ],
      };
      return next;
    });
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: string, value: any) => {
    setDays((prev) => {
      const next = [...prev];
      const day = { ...next[dayIdx], exercises: [...next[dayIdx].exercises] };
      day.exercises[exIdx] = { ...day.exercises[exIdx], [field]: value };
      next[dayIdx] = day;
      return next;
    });
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setDays((prev) => {
      const next = [...prev];
      next[dayIdx] = { ...next[dayIdx], exercises: next[dayIdx].exercises.filter((_, i) => i !== exIdx) };
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) { setNameError(true); return; }
    onSave({
      id: program?.id || crypto.randomUUID(),
      name: name.trim(),
      daysPerWeek,
      createdAt: program?.createdAt || new Date().toISOString(),
      days,
    });
  };

  const restPresets = [30, 60, 90, 120, 180];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{program ? "Edit Program" : "Create Program"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-semibold">Program Name</label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(false); }}
              placeholder="e.g. Push Pull Legs"
              className={`bg-input border-border ${nameError ? "border-destructive" : ""}`}
            />
            {nameError && <p className="text-xs text-destructive mt-1">Name is required</p>}
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold">Days Per Week</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => updateDaysCount(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                    daysPerWeek === n ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {days.map((day, dayIdx) => (
            <div key={dayIdx} className="p-4 rounded-lg border border-border bg-secondary/30">
              <Input
                value={day.label}
                onChange={(e) => {
                  const next = [...days];
                  next[dayIdx] = { ...next[dayIdx], label: e.target.value };
                  setDays(next);
                }}
                className="bg-input border-border font-bold mb-3"
              />

              {day.exercises.map((ex, exIdx) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  onUpdate={(field, val) => updateExercise(dayIdx, exIdx, field, val)}
                  onRemove={() => removeExercise(dayIdx, exIdx)}
                  restPresets={restPresets}
                />
              ))}

              <Button variant="ghost" size="sm" className="text-xs mt-2" onClick={() => addExercise(dayIdx)}>
                <Plus className="h-3 w-3 mr-1" /> Add Exercise
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="font-bold">Save Program</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExerciseRow({
  exercise,
  onUpdate,
  onRemove,
  restPresets,
}: {
  exercise: ProgramExercise;
  onUpdate: (field: string, val: any) => void;
  onRemove: () => void;
  restPresets: number[];
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  return (
    <div className="flex items-start gap-2 mb-2 p-2 rounded bg-card/50 relative">
      <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 cursor-grab shrink-0" />
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="col-span-2 sm:col-span-1 relative">
          <Input
            placeholder="Exercise"
            value={exercise.name}
            onChange={(e) => {
              onUpdate("name", e.target.value);
              if (e.target.value) {
                setSuggestions(COMMON_EXERCISES.filter((c) => c.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 4));
              } else {
                setSuggestions([]);
              }
            }}
            className="bg-input border-border text-sm h-8"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-9 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { onUpdate("name", s); setSuggestions([]); }}
                  className="w-full text-left px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <Input
            type="number"
            min={1}
            max={10}
            value={exercise.sets}
            onChange={(e) => onUpdate("sets", parseInt(e.target.value) || 1)}
            className="bg-input border-border text-sm h-8"
            placeholder="Sets"
          />
        </div>
        <div>
          <Input
            value={exercise.reps}
            onChange={(e) => onUpdate("reps", e.target.value)}
            className="bg-input border-border text-sm h-8"
            placeholder="Reps"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {restPresets.map((r) => (
            <button
              key={r}
              onClick={() => onUpdate("restSeconds", r)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                exercise.restSeconds === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {r >= 60 ? `${r / 60}m` : `${r}s`}
            </button>
          ))}
        </div>
      </div>
      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0 mt-0.5" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
