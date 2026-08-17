import { GripVertical, Calendar as CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface Props {
  task: Task;
  onToggle: () => void;
  onClick: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function TaskCard({ task, onToggle, onClick, dragHandleProps }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
  const isToday = task.dueDate === today;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md sm:p-4",
        isOverdue && "border-destructive/50",
        isToday && !task.completed && "border-primary/30 bg-primary/5",
        task.completed && "opacity-60"
      )}
    >
      <div
        {...dragHandleProps}
        className="mt-1 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <Checkbox
        checked={task.completed}
        onCheckedChange={(e) => {
          e && e !== "indeterminate" ? onToggle() : onToggle();
        }}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5 shrink-0"
      />

      <div
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1"
        onClick={onClick}
      >
        <span
          className={cn(
            "text-sm font-medium leading-snug transition-all sm:text-base",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                isOverdue
                  ? "text-destructive font-medium"
                  : isToday
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              {task.dueDate}
            </span>
          )}
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0", priorityStyles[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {task.category}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
