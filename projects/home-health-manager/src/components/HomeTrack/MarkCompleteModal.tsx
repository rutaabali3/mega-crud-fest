import React, { useState } from "react";
import { X } from "lucide-react";
import { Task, Contractor } from "@/lib/types";
import { todayISO, addDays, formatDate } from "@/lib/dateUtils";

interface MarkCompleteModalProps {
  open: boolean;
  task: Task | null;
  contractors: Contractor[];
  onClose: () => void;
  onComplete: (taskId: string, date: string, cost: number, contractor: string, note: string) => void;
}

export default function MarkCompleteModal({ open, task, contractors, onClose, onComplete }: MarkCompleteModalProps) {
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState<number>(0);
  const [contractor, setContractor] = useState("");
  const [note, setNote] = useState("");

  React.useEffect(() => {
    if (open && task) {
      setDate(todayISO());
      setCost(task.cost || 0);
      setContractor(task.contractorName || "");
      setNote("");
    }
  }, [open, task]);

  if (!open || !task) return null;

  const nextDue = addDays(date, task.recurrenceInterval);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Mark as Complete</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent"><X size={20} /></button>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{task.appliance} — {task.room}</p>

        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Completion Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mb-3 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" />

        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Cost ($)</label>
        <input type="number" value={cost || ""} onChange={(e) => setCost(Number(e.target.value))} className="mb-3 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" placeholder="0" />

        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Contractor</label>
        <input
          value={contractor}
          onChange={(e) => setContractor(e.target.value)}
          list="complete-contractor-list"
          className="mb-3 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none"
          placeholder="Name"
        />
        <datalist id="complete-contractor-list">
          {contractors.map((c) => <option key={c.id} value={c.name} />)}
        </datalist>

        <label className="mb-1 block text-xs font-semibold text-muted-foreground">Notes</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mb-3 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" rows={2} placeholder="Optional notes" />

        {!task.isOneTime && <p className="mb-4 text-xs text-muted-foreground">Next due date will be: {formatDate(nextDue)}</p>}
        {task.isOneTime && <p className="mb-4 text-xs text-warning">This one-time task will be deleted after completion.</p>}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">Cancel</button>
          <button
            onClick={() => onComplete(task.id, date, cost, contractor, note)}
            className="rounded-xl bg-success px-6 py-2 text-sm font-medium text-success-foreground hover:bg-success/90"
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
