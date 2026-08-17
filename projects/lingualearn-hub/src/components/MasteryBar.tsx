import { cn } from "@/lib/utils";

const MASTERY_COLORS = [
  "bg-muted",           // 0 - empty
  "bg-destructive",     // 1 - red
  "bg-warning",         // 2 - amber/orange
  "bg-accent",          // 3 - yellow/amber
  "bg-success/70",      // 4 - lime
  "bg-success",         // 5 - green
];

export function MasteryBar({ level, className }: { level: number; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-default",
            i <= level ? MASTERY_COLORS[i] : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}
