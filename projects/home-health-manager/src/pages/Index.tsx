import React, { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Task, Contractor, ViewType, Room } from "@/lib/types";
import { todayISO, addDays, isBeforeToday } from "@/lib/dateUtils";
import { getSeedTasks, getSeedContractors } from "@/lib/seedData";
import { CustomToastProvider, useCustomToast } from "@/components/HomeTrack/CustomToast";
import NavBar from "@/components/HomeTrack/NavBar";
import BottomTabBar from "@/components/HomeTrack/BottomTabBar";
import Dashboard from "@/components/HomeTrack/Dashboard";
import TasksView from "@/components/HomeTrack/TasksView";
import TaskModal from "@/components/HomeTrack/TaskModal";
import MarkCompleteModal from "@/components/HomeTrack/MarkCompleteModal";
import ContractorsView from "@/components/HomeTrack/ContractorsView";
import CostHistoryView from "@/components/HomeTrack/CostHistoryView";
import ConfirmDialog from "@/components/HomeTrack/ConfirmDialog";

function AppContent() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("home_maintenance_tasks", getSeedTasks());
  const [contractors, setContractors] = useLocalStorage<Contractor[]>("home_maintenance_contractors", getSeedContractors());
  const [darkMode, setDarkMode] = useLocalStorage("home_maintenance_dark", false);
  const [view, setView] = useState<ViewType>("dashboard");
  const [roomFilter, setRoomFilter] = useState<Room | null>(null);
  const [taskModal, setTaskModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [completeModal, setCompleteModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null);
  const { showToast } = useCustomToast();

  // Dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Auto-recalculate statuses
  useEffect(() => {
    const today = todayISO();
    let changed = false;
    const updated = tasks.map((t) => {
      if (t.status === "completed") return t;
      const newStatus = isBeforeToday(t.nextDueDate) ? "overdue" : "pending";
      if (t.status !== newStatus) { changed = true; return { ...t, status: newStatus } as Task; }
      return t;
    });
    if (changed) setTasks(updated);
  }, []);

  const saveTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = task; return n; }
      return [...prev, task];
    });
    setTaskModal({ open: false, task: null });
    showToast(taskModal.task ? "Task updated!" : "Task added!");
  }, [setTasks, showToast, taskModal.task]);

  const handleComplete = useCallback((taskId: string, date: string, cost: number, contractor: string, note: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      if (task.isOneTime) {
        showToast("✓ One-time task completed and removed!");
        return prev.filter((t) => t.id !== taskId);
      }
      const newNext = addDays(date, task.recurrenceInterval);
      const updated: Task = {
        ...task,
        lastDoneDate: date,
        nextDueDate: newNext,
        status: isBeforeToday(newNext) ? "overdue" : "pending",
        cost: cost || task.cost,
        contractorName: contractor || task.contractorName,
        costHistory: [...task.costHistory, { date, cost, note }],
      };
      return prev.map((t) => (t.id === taskId ? updated : t));
    });
    setCompleteModal({ open: false, task: null });
    showToast("✓ Task marked complete!");
  }, [setTasks, showToast]);

  const deleteTask = useCallback(() => {
    if (!deleteConfirm) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    showToast("Task deleted");
  }, [deleteConfirm, setTasks, showToast]);

  const saveContractor = useCallback((c: Contractor) => {
    setContractors((prev) => {
      const idx = prev.findIndex((x) => x.id === c.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = c; return n; }
      return [...prev, c];
    });
    showToast("Contractor saved!");
  }, [setContractors, showToast]);

  const deleteContractor = useCallback((id: string) => {
    setContractors((prev) => prev.filter((c) => c.id !== id));
    showToast("Contractor deleted");
  }, [setContractors, showToast]);

  const handleRoomFilter = (room: Room) => {
    setRoomFilter(room);
    setView("tasks");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar currentView={view} setView={setView} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pb-8">
        {view === "dashboard" && (
          <Dashboard tasks={tasks} onMarkDone={(t) => setCompleteModal({ open: true, task: t })} onRoomFilter={handleRoomFilter} />
        )}
        {view === "tasks" && (
          <TasksView
            tasks={tasks}
            roomFilter={roomFilter}
            onAdd={() => setTaskModal({ open: true, task: null })}
            onEdit={(t) => setTaskModal({ open: true, task: t })}
            onDelete={(t) => setDeleteConfirm(t)}
            onMarkDone={(t) => setCompleteModal({ open: true, task: t })}
            onClearRoomFilter={() => setRoomFilter(null)}
          />
        )}
        {view === "contractors" && (
          <ContractorsView contractors={contractors} onSave={saveContractor} onDelete={deleteContractor} />
        )}
        {view === "costHistory" && <CostHistoryView tasks={tasks} />}
      </main>
      <BottomTabBar currentView={view} setView={setView} />
      <TaskModal
        open={taskModal.open}
        task={taskModal.task}
        contractors={contractors}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSave={saveTask}
      />
      <MarkCompleteModal
        open={completeModal.open}
        task={completeModal.task}
        contractors={contractors}
        onClose={() => setCompleteModal({ open: false, task: null })}
        onComplete={handleComplete}
      />
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm?.appliance}"? This cannot be undone.`}
        onConfirm={deleteTask}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

const Index = () => (
  <CustomToastProvider>
    <AppContent />
  </CustomToastProvider>
);

export default Index;
