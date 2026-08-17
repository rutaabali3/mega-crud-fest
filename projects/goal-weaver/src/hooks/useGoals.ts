import { useState, useEffect, useCallback } from "react";
import type { Goal, ProgressLog } from "@/types/goal";

const STORAGE_KEY = "goals";

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);

  // Auto-save on every change
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const createGoal = useCallback((data: Pick<Goal, "title" | "unit" | "target" | "deadline">): Goal => {
    if (data.target <= 0) throw new Error("Target must be positive");
    const newGoal: Goal = {
      id: generateId(),
      title: data.title.trim(),
      unit: data.unit,
      target: data.target,
      deadline: data.deadline,
      createdAt: new Date().toISOString(),
      isArchived: false,
      progressLogs: [],
    };
    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, data: Partial<Pick<Goal, "title" | "unit" | "target" | "deadline">>) => {
    if (data.target !== undefined && data.target <= 0) throw new Error("Target must be positive");
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, []);

  const logProgress = useCallback((goalId: string, amount: number, date: string, note?: string): ProgressLog => {
    if (amount <= 0) throw new Error("Amount must be positive");
    const entry: ProgressLog = { id: generateId(), date, amount, note: note?.trim() || undefined };
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, progressLogs: [...g.progressLogs, entry] } : g)));
    return entry;
  }, []);

  const deleteProgressLog = useCallback((goalId: string, logId: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, progressLogs: g.progressLogs.filter((l) => l.id !== logId) } : g))
    );
  }, []);

  const archiveGoal = useCallback((id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, isArchived: true } : g)));
  }, []);

  const unarchiveGoal = useCallback((id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, isArchived: false } : g)));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setGoals([]);
  }, []);

  const importGoals = useCallback((data: Goal[]) => {
    setGoals(data);
  }, []);

  const exportGoals = useCallback((): string => {
    return JSON.stringify(goals, null, 2);
  }, [goals]);

  return {
    goals,
    createGoal,
    updateGoal,
    logProgress,
    deleteProgressLog,
    archiveGoal,
    unarchiveGoal,
    deleteGoal,
    clearAll,
    importGoals,
    exportGoals,
  };
}

/** Helper: compute total progress for a goal */
export function getTotalProgress(goal: Goal): number {
  return goal.progressLogs.reduce((sum, l) => sum + l.amount, 0);
}

/** Helper: compute progress percentage (capped at 100) */
export function getProgressPercent(goal: Goal): number {
  return Math.min(100, (getTotalProgress(goal) / goal.target) * 100);
}

/** Helper: check if goal is completed */
export function isCompleted(goal: Goal): boolean {
  return getTotalProgress(goal) >= goal.target;
}

/** Helper: check if goal is overdue (not completed and past deadline) */
export function isOverdue(goal: Goal): boolean {
  return !isCompleted(goal) && new Date(goal.deadline) < new Date(new Date().toDateString());
}
