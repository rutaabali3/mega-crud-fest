import { useState, useCallback, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import MyGoals from "@/pages/MyGoals";
import SettingsPage from "@/pages/SettingsPage";
import { GoalDetailDialog } from "@/components/GoalDetailDialog";
import { useGoals, getTotalProgress } from "@/hooks/useGoals";
import { fireConfetti } from "@/lib/confetti";
import type { Goal } from "@/types/goal";

export default function Index() {
  const {
    goals, createGoal, updateGoal, logProgress, deleteProgressLog,
    archiveGoal, unarchiveGoal, deleteGoal, clearAll, importGoals, exportGoals,
  } = useGoals();

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Track previous completion state for confetti
  const prevCompleted = useRef<Set<string>>(new Set(goals.filter((g) => getTotalProgress(g) >= g.target).map((g) => g.id)));

  // Check for newly completed goals after any state change
  useEffect(() => {
    goals.forEach((g) => {
      if (getTotalProgress(g) >= g.target && !prevCompleted.current.has(g.id)) {
        fireConfetti();
        toast.success(`🎉 Goal completed: "${g.title}"!`);
        prevCompleted.current.add(g.id);
      }
    });
  }, [goals]);

  const handleCreate = useCallback((data: { title: string; unit: string; target: number; deadline: string }) => {
    createGoal(data);
    toast.success("Goal created!");
  }, [createGoal]);

  const handleLog = useCallback((goalId: string, amount: number, date: string, note?: string) => {
    logProgress(goalId, amount, date, note);
    toast.success("Progress logged!");
  }, [logProgress]);

  const handleUpdate = useCallback((id: string, data: Partial<Pick<Goal, "title" | "unit" | "target" | "deadline">>) => {
    updateGoal(id, data);
    toast.success("Goal updated!");
    // Refresh selected goal
    setSelectedGoal((prev) => prev && prev.id === id ? { ...prev, ...data } : prev);
  }, [updateGoal]);

  const handleArchive = useCallback((id: string) => {
    archiveGoal(id);
    toast.info("Goal archived.");
  }, [archiveGoal]);

  const handleUnarchive = useCallback((id: string) => {
    unarchiveGoal(id);
    toast.info("Goal restored.");
  }, [unarchiveGoal]);

  const handleDelete = useCallback((id: string) => {
    deleteGoal(id);
    toast.success("Goal deleted.");
  }, [deleteGoal]);

  const handleDeleteLog = useCallback((goalId: string, logId: string) => {
    deleteProgressLog(goalId, logId);
    toast.info("Progress entry removed.");
  }, [deleteProgressLog]);

  const openDetail = useCallback((goal: Goal) => {
    setSelectedGoal(goal);
    setDetailOpen(true);
  }, []);

  // Keep selectedGoal in sync with goals state
  const currentGoal = selectedGoal ? goals.find((g) => g.id === selectedGoal.id) ?? null : null;

  return (
    <>
      <Dashboard goals={goals} onCreate={handleCreate} onLog={handleLog} onSelectGoal={openDetail} />
      <GoalDetailDialog
        goal={currentGoal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={handleUpdate}
        onLog={handleLog}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
        onDelete={handleDelete}
        onDeleteLog={handleDeleteLog}
      />
    </>
  );
}
