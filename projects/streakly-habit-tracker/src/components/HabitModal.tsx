import { useState } from "react";
import { Habit, DEFAULT_COLORS } from "@/types/habit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface HabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habit: Habit) => void;
  editHabit?: Habit | null;
}

export function HabitModal({ open, onOpenChange, onSave, editHabit }: HabitModalProps) {
  const [name, setName] = useState(editHabit?.name || "");
  const [frequency, setFrequency] = useState<"daily" | "weekly">(editHabit?.frequency || "daily");
  const [targetStreak, setTargetStreak] = useState(editHabit?.targetStreak || 30);
  const [color, setColor] = useState(editHabit?.color || DEFAULT_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: editHabit?.id || crypto.randomUUID(),
      name: name.trim(),
      frequency,
      targetStreak,
      color,
      completions: editHabit?.completions || [],
    });
    onOpenChange(false);
    setName("");
    setFrequency("daily");
    setTargetStreak(30);
    setColor(DEFAULT_COLORS[0]);
  };

  // Reset form when opening with editHabit
  const handleOpenChange = (o: boolean) => {
    if (o && editHabit) {
      setName(editHabit.name);
      setFrequency(editHabit.frequency);
      setTargetStreak(editHabit.targetStreak);
      setColor(editHabit.color);
    } else if (o && !editHabit) {
      setName("");
      setFrequency("daily");
      setTargetStreak(30);
      setColor(DEFAULT_COLORS[0]);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {editHabit ? "Edit Habit" : "Create New Habit"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Read 30 minutes"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {(["daily", "weekly"] as const).map(f => (
                <Button
                  key={f}
                  variant={frequency === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFrequency(f)}
                  className="capitalize flex-1"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Streak (days)</Label>
            <Input
              id="target"
              type="number"
              min={1}
              max={365}
              value={targetStreak}
              onChange={e => setTargetStreak(Number(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all border-2",
                    color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editHabit ? "Save Changes" : "Create Habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
