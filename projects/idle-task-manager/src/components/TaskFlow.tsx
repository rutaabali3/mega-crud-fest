import { useRef, useEffect, useCallback, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { TaskHeader } from "@/components/TaskHeader";
import { TaskFilters } from "@/components/TaskFilters";
import { TaskList } from "@/components/TaskList";
import { TaskModal } from "@/components/TaskModal";
import { EmptyState } from "@/components/EmptyState";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export default function TaskFlow() {
  const {
    tasks,
    allTasks,
    filter,
    setFilter,
    search,
    setSearch,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    clearCompleted,
    reorder,
    counts,
  } = useTasks();

  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const searchRef = useRef<HTMLInputElement>(null!);

  const handleAdd = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: { title: string; dueDate: string | null; priority: "low" | "medium" | "high"; category: string }) => {
      if (editingTask) {
        updateTask(editingTask.id, data);
        toast({ title: "Task updated" });
      } else {
        addTask(data);
        toast({ title: "Task added! 🎉" });
      }
    },
    [editingTask, updateTask, addTask, toast]
  );

  const handleToggle = useCallback(
    (id: string) => {
      const task = allTasks.find((t) => t.id === id);
      toggleComplete(id);
      if (task && !task.completed) {
        toast({ title: "Task completed! ✅" });
      }
    },
    [allTasks, toggleComplete, toast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTask(id);
      toast({ title: "Task deleted", variant: "destructive" });
    },
    [deleteTask, toast]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "n") {
        e.preventDefault();
        handleAdd();
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAdd]);

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-background">
      <TaskHeader />

      <TaskFilters
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        counts={counts}
        searchRef={searchRef}
      />

      <div className="mt-4">
        {allTasks.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : tasks.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No tasks match your filter.
          </p>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onReorder={reorder}
            />
            {counts.completed > 0 && filter !== "completed" && (
              <div className="flex justify-center pb-24">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                      <Trash2 className="h-3 w-3" />
                      Clear {counts.completed} completed
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove all completed tasks.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearCompleted}>
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={handleAdd}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:bottom-8 sm:right-8"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
