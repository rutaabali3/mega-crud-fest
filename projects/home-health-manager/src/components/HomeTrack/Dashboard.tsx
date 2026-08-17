import React from "react";
import { AlertTriangle, Calendar, DollarSign, ListTodo, ChevronRight, CheckCircle } from "lucide-react";
import { Task, Room, ROOMS } from "@/lib/types";
import { formatDate, daysOverdue, isThisMonth, isThisYear, isBeforeToday, todayISO, getWeekGroup } from "@/lib/dateUtils";

interface DashboardProps {
  tasks: Task[];
  onMarkDone: (task: Task) => void;
  onRoomFilter: (room: Room) => void;
}

export default function Dashboard({ tasks, onMarkDone, onRoomFilter }: DashboardProps) {
  const overdueTasks = tasks.filter((t) => t.status === "overdue").sort((a, b) => daysOverdue(b.nextDueDate) - daysOverdue(a.nextDueDate));
  const dueThisMonth = tasks.filter((t) => t.status !== "completed" && isThisMonth(t.nextDueDate) && !isBeforeToday(t.nextDueDate));
  const totalSpentThisYear = tasks.reduce((sum, t) => sum + t.costHistory.filter((c) => isThisYear(c.date)).reduce((s, c) => s + c.cost, 0), 0);

  const upcoming = tasks
    .filter((t) => t.status === "pending" && !isBeforeToday(t.nextDueDate))
    .filter((t) => {
      const diff = Math.round((new Date(t.nextDueDate).getTime() - new Date(todayISO()).getTime()) / 86400000);
      return diff <= 30;
    })
    .sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));

  const grouped = upcoming.reduce<Record<string, Task[]>>((acc, t) => {
    const g = getWeekGroup(t.nextDueDate);
    (acc[g] = acc[g] || []).push(t);
    return acc;
  }, {});

  const roomStats = ROOMS.map((room) => {
    const roomTasks = tasks.filter((t) => t.room === room);
    return { room, total: roomTasks.length, overdue: roomTasks.filter((t) => t.status === "overdue").length };
  }).filter((r) => r.total > 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<ListTodo size={20} />} label="Total Tasks" value={tasks.length} color="primary" />
        <StatCard icon={<AlertTriangle size={20} />} label="Overdue" value={overdueTasks.length} color="destructive" />
        <StatCard icon={<Calendar size={20} />} label="Due This Month" value={dueThisMonth.length} color="warning" />
        <StatCard icon={<DollarSign size={20} />} label="Spent This Year" value={`$${totalSpentThisYear.toLocaleString()}`} color="success" />
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-destructive">
            <AlertTriangle size={18} /> Overdue Tasks
          </h2>
          <div className="space-y-2">
            {overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 rounded-lg bg-accent px-2 py-0.5 text-xs font-medium">{t.room}</span>
                  <span className="truncate font-medium">{t.appliance}</span>
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    {daysOverdue(t.nextDueDate)}d overdue
                  </span>
                </div>
                <button
                  onClick={() => onMarkDone(t)}
                  className="shrink-0 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-foreground transition-colors hover:bg-success/90"
                >
                  Mark Done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold">Upcoming (Next 30 Days)</h2>
          {(["This Week", "Next Week", "Later This Month"] as const).map((group) =>
            grouped[group]?.length ? (
              <div key={group} className="mb-3">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                <div className="space-y-1.5">
                  {grouped[group].map((t) => (
                    <div key={t.id} className="flex items-center gap-2 rounded-xl bg-card p-3 shadow-sm">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t.room}</span>
                      <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs">{t.taskType}</span>
                      <span className="flex-1 truncate font-medium">{t.appliance}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(t.nextDueDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Room Breakdown */}
      {roomStats.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold">Rooms</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {roomStats.map((r) => (
              <button
                key={r.room}
                onClick={() => onRoomFilter(r.room)}
                className="flex flex-col rounded-2xl bg-card p-4 shadow-sm transition-shadow hover:shadow-md text-left"
              >
                <span className="text-sm font-semibold">{r.room}</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.total} tasks</span>
                  {r.overdue > 0 && (
                    <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs font-semibold text-destructive">
                      {r.overdue} overdue
                    </span>
                  )}
                </div>
                <ChevronRight size={14} className="mt-2 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle size={48} className="mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground/70">Add your first maintenance task to get started</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
  };
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-xl p-2 ${colorMap[color]}`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
