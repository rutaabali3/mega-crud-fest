import { Habit } from "@/types/habit";
import { getCurrentStreak, getLongestStreak } from "@/lib/streaks";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Pencil, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HabitCardProps {
  habit: Habit;
  isActive: boolean;
  onClick: () => void;
  onEdit: () => void;
  onArchive: () => void;
}

export function HabitCard({ habit, isActive, onClick, onEdit, onArchive }: HabitCardProps) {
  const streak = getCurrentStreak(habit);
  const longest = getLongestStreak(habit);
  const progress = Math.min((streak / habit.targetStreak) * 100, 100);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-accent border-primary/40 shadow-sm"
          : "border-transparent hover:bg-accent/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: habit.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm truncate text-card-foreground">{habit.name}</h3>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Edit ${habit.name}`}
                onClick={e => { e.stopPropagation(); onEdit(); }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Archive ${habit.name}`}
                onClick={e => { e.stopPropagation(); onArchive(); }}
              >
                <Archive className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              🔥 <span className="font-mono font-bold text-card-foreground">{streak}</span>
            </span>
            <span>Best: {longest}</span>
            <span className="capitalize text-[10px] px-1.5 py-0.5 rounded bg-secondary">
              {habit.frequency}
            </span>
          </div>
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {streak}/{habit.targetStreak} day target
          </p>
        </div>
      </div>
    </div>
  );
}
