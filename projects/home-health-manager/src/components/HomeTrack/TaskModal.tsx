import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Task, Room, ROOMS, TASK_TYPES, RECURRENCE_OPTIONS, TaskType, RecurrenceLabel, Contractor } from "@/lib/types";
import { todayISO, addDays, formatDate } from "@/lib/dateUtils";

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  contractors: Contractor[];
  onClose: () => void;
  onSave: (task: Task) => void;
}

const defaultTask = (): Partial<Task> => ({
  room: "Kitchen",
  appliance: "",
  taskType: "Cleaning",
  lastDoneDate: todayISO(),
  recurrenceInterval: 30,
  recurrenceLabel: "Monthly",
  isOneTime: false,
  contractorName: "",
  contractorPhone: "",
  contractorNote: "",
  cost: null,
});

export default function TaskModal({ open, task, contractors, onClose, onSave }: TaskModalProps) {
  const [form, setForm] = useState<Partial<Task>>(defaultTask());
  const [customDays, setCustomDays] = useState(30);
  const [showContractor, setShowContractor] = useState(false);

  useEffect(() => {
    if (task) {
      setForm(task);
      setCustomDays(task.recurrenceInterval);
      setShowContractor(!!(task.contractorName || task.cost));
    } else {
      setForm(defaultTask());
      setCustomDays(30);
      setShowContractor(false);
    }
  }, [task, open]);

  if (!open) return null;

  const interval = form.recurrenceLabel === "Custom" ? customDays : RECURRENCE_OPTIONS.find((r) => r.label === form.recurrenceLabel)?.days || 30;
  const nextDue = form.lastDoneDate ? addDays(form.lastDoneDate, interval) : "";

  const handleSave = () => {
    if (!form.appliance?.trim()) return;
    const saved: Task = {
      id: task?.id || crypto.randomUUID(),
      room: form.room as Room,
      appliance: form.appliance!.trim(),
      taskType: form.taskType as TaskType,
      lastDoneDate: form.lastDoneDate || todayISO(),
      recurrenceInterval: interval,
      recurrenceLabel: form.recurrenceLabel as RecurrenceLabel,
      nextDueDate: nextDue,
      isOneTime: form.isOneTime || false,
      status: nextDue < todayISO() ? "overdue" : "pending",
      completedDate: task?.completedDate || null,
      contractorName: form.contractorName || "",
      contractorPhone: form.contractorPhone || "",
      contractorNote: form.contractorNote || "",
      cost: form.cost ?? null,
      costHistory: task?.costHistory || [],
    };
    onSave(saved);
  };

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-card p-6 shadow-xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{task ? "Edit Task" : "Add Task"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><X size={20} /></button>
        </div>

        {/* Room */}
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Room</label>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => set("room", r)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${form.room === r ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Appliance */}
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Appliance</label>
        <input
          value={form.appliance || ""}
          onChange={(e) => set("appliance", e.target.value)}
          placeholder="e.g. HVAC Filter, Kitchen Faucet"
          className="mb-4 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Task Type */}
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Task Type</label>
        <select
          value={form.taskType}
          onChange={(e) => set("taskType", e.target.value)}
          className="mb-4 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
        >
          {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>

        {/* Last Done Date */}
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Last Done Date</label>
        <input
          type="date"
          value={form.lastDoneDate || ""}
          onChange={(e) => set("lastDoneDate", e.target.value)}
          className="mb-4 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
        />

        {/* Recurrence */}
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Recurrence</label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {RECURRENCE_OPTIONS.map((r) => (
            <button
              key={r.label}
              onClick={() => { set("recurrenceLabel", r.label); if (r.days) setCustomDays(r.days); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${form.recurrenceLabel === r.label ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/80"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {form.recurrenceLabel === "Custom" && (
          <input
            type="number"
            min={1}
            value={customDays}
            onChange={(e) => setCustomDays(Number(e.target.value))}
            className="mb-2 w-32 rounded-xl border bg-background px-3 py-2 text-sm outline-none"
            placeholder="Days"
          />
        )}
        {nextDue && <p className="mb-4 text-xs text-muted-foreground">Next due: {formatDate(nextDue)}</p>}

        {/* One-time */}
        <label className="mb-4 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isOneTime || false} onChange={(e) => set("isOneTime", e.target.checked)} className="rounded" />
          <span className="text-sm">One-time task (auto-delete after completion)</span>
        </label>

        {/* Contractor section */}
        <button onClick={() => setShowContractor(!showContractor)} className="mb-3 text-xs font-semibold text-primary underline">
          {showContractor ? "Hide" : "Show"} Contractor & Cost
        </button>
        {showContractor && (
          <div className="mb-4 space-y-3 rounded-xl bg-accent/50 p-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Contractor</label>
              <input
                value={form.contractorName || ""}
                onChange={(e) => set("contractorName", e.target.value)}
                list="contractor-list"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
                placeholder="Name"
              />
              <datalist id="contractor-list">
                {contractors.map((c) => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <input
              value={form.contractorPhone || ""}
              onChange={(e) => set("contractorPhone", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
              placeholder="Phone"
              type="tel"
            />
            <input
              type="number"
              value={form.cost ?? ""}
              onChange={(e) => set("cost", e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
              placeholder="Cost ($)"
            />
            <textarea
              value={form.contractorNote || ""}
              onChange={(e) => set("contractorNote", e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
              placeholder="Notes"
              rows={2}
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
