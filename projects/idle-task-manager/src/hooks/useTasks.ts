import { useState, useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Task, FilterType } from "@/types/task";

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("taskflow-tasks", []);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const addTask = useCallback(
    (data: Omit<Task, "id" | "createdAt" | "order" | "completed">) => {
      const newTask: Task = {
        ...data,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
        order: tasks.length,
      };
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [tasks.length, setTasks]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [setTasks]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    },
    [setTasks]
  );

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  }, [setTasks]);

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setTasks((prev) => {
        const result = [...prev];
        const [removed] = result.splice(fromIndex, 1);
        result.splice(toIndex, 0, removed);
        return result.map((t, i) => ({ ...t, order: i }));
      });
    },
    [setTasks]
  );

  const today = new Date().toISOString().split("T")[0];

  const counts = useMemo(() => {
    const all = tasks.filter((t) => !t.completed).length;
    const todayCount = tasks.filter(
      (t) => !t.completed && t.dueDate === today
    ).length;
    const upcoming = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate > today
    ).length;
    const completed = tasks.filter((t) => t.completed).length;
    return { all, today: todayCount, upcoming, completed };
  }, [tasks, today]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks].sort((a, b) => a.order - b.order);

    // Apply filter
    switch (filter) {
      case "today":
        result = result.filter((t) => !t.completed && t.dueDate === today);
        break;
      case "upcoming":
        result = result.filter(
          (t) => !t.completed && t.dueDate && t.dueDate > today
        );
        break;
      case "completed":
        result = result.filter((t) => t.completed);
        break;
      case "all":
      default:
        break;
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, filter, search, today]);

  return {
    tasks: filteredTasks,
    allTasks: tasks,
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
  };
}
