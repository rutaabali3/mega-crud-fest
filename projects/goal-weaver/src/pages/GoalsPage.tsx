// Wrapper for MyGoals page used by the router
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import MyGoals from "@/pages/MyGoals";
import { GoalDetailDialog } from "@/components/GoalDetailDialog";
import { useGoals, getTotalProgress } from "@/hooks/useGoals";
import { fireConfetti } from "@/lib/confetti";
import type { Goal } from "@/types/goal";

export default function GoalsPage() {
  const {
    goals, createGoal, updateGoal, logProgress, deleteProgressLog,
    archiveGoal, unarchiveGoal, deleteGoal,
  } = useGoals();

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const prevCompleted = useRef<Set<string>>(new Set(goals.filter((g) => getTotalProgress(g) >= g.target).map((g) => g.id)));

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

  const currentGoal = selectedGoal ? goals.find((g) => g.id === selectedGoal.id) ?? null : null;

  return (
    <>
      <MyGoals
        goals={goals}
        onCreate={handleCreate}
        onLog={handleLog}
        onSelectGoal={(goal) => { setSelectedGoal(goal); setDetailOpen(true); }}
      />
      <GoalDetailDialog
        goal={currentGoal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={(id, data) => { updateGoal(id, data); toast.success("Goal updated!"); }}
        onLog={handleLog}
        onArchive={(id) => { archiveGoal(id); toast.info("Goal archived."); }}
        onUnarchive={(id) => { unarchiveGoal(id); toast.info("Goal restored."); }}
        onDelete={(id) => { deleteGoal(id); toast.success("Goal deleted."); }}
        onDeleteLog={(gid, lid) => { deleteProgressLog(gid, lid); toast.info("Entry removed."); }}
      />
    </>
  );
}
