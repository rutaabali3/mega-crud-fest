import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { Task } from "@/types/task";
import { CATEGORY_SUGGESTIONS } from "@/types/task";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (data: {
    title: string;
    dueDate: string | null;
    priority: "low" | "medium" | "high";
    category: string;
  }) => void;
  onDelete?: (id: string) => void;
}

const priorities: { value: Task["priority"]; label: string; className: string }[] = [
  { value: "low", label: "Low", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" },
  { value: "medium", label: "Medium", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
  { value: "high", label: "High", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700" },
];

export function TaskModal({ open, onOpenChange, task, onSave, onDelete }: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [category, setCategory] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
        setPriority(task.priority);
        setCategory(task.category);
      } else {
        setTitle("");
        setDueDate(undefined);
        setPriority("medium");
        setCategory("");
      }
    }
  }, [open, task]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim().slice(0, 120),
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      priority,
      category: category.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update your task details below." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              placeholder="What needs to be done?"
              maxLength={120}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/120
            </p>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(d) => {
                    setDueDate(d);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setDueDate(undefined)}
              >
                Clear date
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    p.className,
                    priority === p.value
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2">
          {task && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="mr-auto gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(task.id);
                      onOpenChange(false);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {task ? "Save" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
