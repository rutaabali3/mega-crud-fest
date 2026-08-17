import { useWorkout } from "@/context/WorkoutContext";
import { Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestTimerOverlay() {
  const { restTimer, pauseRestTimer, resumeRestTimer, skipRestTimer, startRestTimer } =
    useWorkout();

  if (!restTimer.active) return null;

  const minutes = Math.floor(restTimer.remaining / 60);
  const seconds = restTimer.remaining % 60;
  const progress = restTimer.total > 0 ? restTimer.remaining / restTimer.total : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference * (1 - progress);

  const presets = [30, 60, 90, 120, 180];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-card border-t border-border px-4 py-3 sm:bottom-0 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
          <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
            className="transition-all duration-1000 ease-linear"
          />
          <text x="40" y="44" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="18">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </text>
        </svg>
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => startRestTimer(p)}
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {p >= 60 ? `${p / 60}m` : `${p}s`}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {restTimer.paused ? (
          <Button size="icon" variant="ghost" onClick={resumeRestTimer}>
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" onClick={pauseRestTimer}>
            <Pause className="h-5 w-5" />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={skipRestTimer}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
