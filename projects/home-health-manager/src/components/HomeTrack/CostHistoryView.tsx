import React, { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Calendar, Award } from "lucide-react";
import { Task } from "@/lib/types";
import { formatDate, isThisYear, isThisMonth, getMonthYear } from "@/lib/dateUtils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

interface CostHistoryViewProps {
  tasks: Task[];
}

const ROOM_COLORS: Record<string, string> = {
  Kitchen: "#3B82F6",
  Bathroom: "#8B5CF6",
  Bedroom: "#EC4899",
  "Living Room": "#10B981",
  Garage: "#F59E0B",
  Exterior: "#EF4444",
  Basement: "#6366F1",
  Other: "#6B7280",
};

export default function CostHistoryView({ tasks }: CostHistoryViewProps) {
  const [sortCol, setSortCol] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const allEntries = useMemo(() => {
    return tasks.flatMap((t) =>
      t.costHistory.map((c) => ({
        date: c.date,
        room: t.room,
        appliance: t.appliance,
        taskType: t.taskType,
        contractor: t.contractorName || "—",
        cost: c.cost,
        note: c.note,
      }))
    );
  }, [tasks]);

  const totalAll = allEntries.reduce((s, e) => s + e.cost, 0);
  const totalYear = allEntries.filter((e) => isThisYear(e.date)).reduce((s, e) => s + e.cost, 0);
  const totalMonth = allEntries.filter((e) => isThisMonth(e.date)).reduce((s, e) => s + e.cost, 0);
  const mostExpensive = allEntries.length ? allEntries.reduce((a, b) => (a.cost > b.cost ? a : b)) : null;

  // Chart data: past 12 months
  const chartData = useMemo(() => {
    const months: { label: string; [room: string]: number | string }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear().toString().slice(-2)}`;
      const entry: any = { label };
      allEntries
        .filter((e) => {
          const ed = new Date(e.date);
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
        })
        .forEach((e) => {
          entry[e.room] = (entry[e.room] || 0) + e.cost;
        });
      months.push(entry);
    }
    return months;
  }, [allEntries]);

  const rooms = useMemo(() => [...new Set(allEntries.map((e) => e.room))], [allEntries]);

  // Sorted table
  const sorted = useMemo(() => {
    const list = [...allEntries];
    list.sort((a, b) => {
      const av = (a as any)[sortCol];
      const bv = (b as any)[sortCol];
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [allEntries, sortCol, sortDir]);

  const perPage = 10;
  const totalPages = Math.ceil(sorted.length / perPage);
  const pageData = sorted.slice(page * perPage, (page + 1) * perPage);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SumCard icon={<DollarSign size={20} />} label="All Time" value={`$${totalAll.toLocaleString()}`} />
        <SumCard icon={<TrendingUp size={20} />} label="This Year" value={`$${totalYear.toLocaleString()}`} />
        <SumCard icon={<Calendar size={20} />} label="This Month" value={`$${totalMonth.toLocaleString()}`} />
        <SumCard icon={<Award size={20} />} label="Most Expensive" value={mostExpensive ? `$${mostExpensive.cost}` : "—"} sub={mostExpensive?.appliance} />
      </div>

      {/* Chart */}
      {allEntries.length > 0 && (
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Monthly Spending (12 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {rooms.map((r) => (
                <Bar key={r} dataKey={r} stackId="a" fill={ROOM_COLORS[r] || "#6B7280"} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      {allEntries.length > 0 && (
        <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                {[
                  { key: "date", label: "Date" },
                  { key: "room", label: "Room" },
                  { key: "appliance", label: "Appliance" },
                  { key: "taskType", label: "Type" },
                  { key: "contractor", label: "Contractor" },
                  { key: "cost", label: "Cost" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="cursor-pointer px-4 py-3 font-semibold text-muted-foreground hover:text-foreground"
                  >
                    {col.label} {sortCol === col.key && (sortDir === "asc" ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((e, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-2.5">{formatDate(e.date)}</td>
                  <td className="px-4 py-2.5"><span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{e.room}</span></td>
                  <td className="px-4 py-2.5">{e.appliance}</td>
                  <td className="px-4 py-2.5">{e.taskType}</td>
                  <td className="px-4 py-2.5">{e.contractor}</td>
                  <td className="px-4 py-2.5 font-medium">${e.cost}</td>
                </tr>
              ))}
              <tr className="bg-accent/30 font-semibold">
                <td className="px-4 py-2.5" colSpan={5}>Total</td>
                <td className="px-4 py-2.5">${sorted.reduce((s, e) => s + e.cost, 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-2">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="text-xs text-primary disabled:text-muted-foreground">← Prev</button>
              <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="text-xs text-primary disabled:text-muted-foreground">Next →</button>
            </div>
          )}
        </div>
      )}

      {allEntries.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <DollarSign size={48} className="mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No cost history yet</p>
        </div>
      )}
    </div>
  );
}

function SumCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
