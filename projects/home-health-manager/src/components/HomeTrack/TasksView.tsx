import React, { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { Task, Room, ROOMS } from "@/lib/types";
import { formatDate, daysOverdue, isBeforeToday, todayISO, daysBetween } from "@/lib/dateUtils";

interface TasksViewProps {
  tasks: Task[];
  roomFilter: Room | null;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMarkDone: (task: Task) => void;
  onClearRoomFilter: () => void;
}

export default function TasksView({ tasks, roomFilter, onAdd, onEdit, onDelete, onMarkDone, onClearRoomFilter }: TasksViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "overdue" | "completed">("all");
  const [roomDropdown, setRoomDropdown] = useState<Room | "">(roomFilter || "");
  const [sortBy, setSortBy] = useState<"due" | "room" | "lastDone" | "cost">("due");

  const filtered = useMemo(() => {
    let list = [...tasks];
    const q = search.toLowerCase();
    if (q) list = list.filter((t) => `${t.appliance} ${t.taskType} ${t.room}`.toLowerCase().includes(q));
    const activeRoom = roomFilter || roomDropdown;
    if (activeRoom) list = list.filter((t) => t.room === activeRoom);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    list.sort((a, b) => {
      if (sortBy === "due") return a.nextDueDate.localeCompare(b.nextDueDate);
      if (sortBy === "room") return a.room.localeCompare(b.room);
      if (sortBy === "lastDone") return b.lastDoneDate.localeCompare(a.lastDoneDate);
      return (b.cost || 0) - (a.cost || 0);
    });
    return list;
  }, [tasks, search, roomFilter, roomDropdown, statusFilter, sortBy]);

  const getBorderColor = (t: Task) => {
    if (t.status === "completed") return "border-l-muted-foreground/30";
    if (t.status === "overdue") return "border-l-destructive";
    const diff = daysBetween(todayISO(), t.nextDueDate);
    if (diff <= 7) return "border-l-warning";
    return "border-l-success";
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="sticky top-14 z-40 -mx-4 bg-background px-4 pb-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={roomFilter || roomDropdown}
            onChange={(e) => { onClearRoomFilter(); setRoomDropdown(e.target.value as Room | ""); }}
            className="rounded-xl border bg-card px-3 py-2 text-sm outline-none"
          >
            <option value="">All Rooms</option>
            {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-xl border bg-card px-3 py-2 text-sm outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="completed">Completed</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-xl border bg-card px-3 py-2 text-sm outline-none">
            <option value="due">Due Date</option>
            <option value="room">Room</option>
            <option value="lastDone">Last Done</option>
            <option value="cost">Cost</option>
          </select>
        </div>
        {roomFilter && (
          <button onClick={onClearRoomFilter} className="mt-2 text-xs text-primary underline">
            Clear room filter: {roomFilter}
          </button>
        )}
      </div>

      {/* Task Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircle size={48} className="mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className={`rounded-2xl border-l-4 ${getBorderColor(t)} bg-card p-4 shadow-sm`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t.room}</span>
                    <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs">{t.taskType}</span>
                    {t.isOneTime && <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">One-time</span>}
                  </div>
                  <p className="text-base font-semibold">{t.appliance}</p>
                  {t.status === "overdue" ? (
                    <p className="text-sm font-medium text-destructive">Overdue by {daysOverdue(t.nextDueDate)} days</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Next due: {formatDate(t.nextDueDate)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t.recurrenceLabel}{t.recurrenceLabel === "Custom" ? ` (${t.recurrenceInterval}d)` : ""}</p>
                  {t.cost != null && t.cost > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ${t.cost} {t.contractorName && `· ${t.contractorName}`} {t.lastDoneDate && `· ${formatDate(t.lastDoneDate)}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {t.status !== "completed" && (
                    <button onClick={() => onMarkDone(t)} className="rounded-xl bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:bg-success/90">
                      ✓ Done
                    </button>
                  )}
                  <button onClick={() => onEdit(t)} className="rounded-xl p-2 text-muted-foreground hover:bg-accent">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(t)} className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onAdd}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:bottom-6"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
