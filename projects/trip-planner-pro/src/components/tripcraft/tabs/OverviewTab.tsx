import React, { useState } from "react";
import { Trip } from "@/types/trip";
import ConfirmDialog from "../ConfirmDialog";
import {
  formatDate, getDaysUntil, getTripDuration, getPackingProgress, generateId,
} from "@/lib/tripUtils";
import {
  MapPin, Calendar, Hotel, DollarSign, Trash2, Plus, AlertTriangle,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const EXPENSE_COLORS: Record<string, string> = {
  food: "#38bdf8",
  transport: "#a78bfa",
  accommodation: "#f97316",
  activity: "#34d399",
  other: "#94a3b8",
};

interface Props {
  trip: Trip;
  updateTrip: (t: Trip) => void;
  deleteTrip: (id: string) => void;
}

export default function OverviewTab({ trip, updateTrip, deleteTrip }: Props) {
  const [showExpForm, setShowExpForm] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCat, setExpCat] = useState<string>("food");
  const [confirmDeleteTrip, setConfirmDeleteTrip] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  const spent = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = trip.budget.total - spent;
  const budgetPct = trip.budget.total > 0 ? Math.round((spent / trip.budget.total) * 100) : 0;
  const { packed, total } = getPackingProgress(trip);
  const totalActivities = trip.itinerary.reduce((s, d) => s + d.activities.length, 0);

  const chartData = Object.entries(
    trip.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const addExpense = () => {
    if (!expDesc.trim() || !expAmount) return;
    const updated = {
      ...trip,
      expenses: [
        ...trip.expenses,
        { id: generateId(), date: expDate, description: expDesc, amount: parseFloat(expAmount), category: expCat as any },
      ],
    };
    updateTrip(updated);
    setExpDesc("");
    setExpAmount("");
    setShowExpForm(false);
  };

  const removeExpense = (id: string) => {
    updateTrip({ ...trip, expenses: trip.expenses.filter((e) => e.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Budget warnings */}
      {budgetPct > 100 && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> You've exceeded your budget!
        </div>
      )}
      {budgetPct > 80 && budgetPct <= 100 && (
        <div className="flex items-center gap-2 rounded-xl bg-yellow-100 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4" /> You've used {budgetPct}% of your budget
        </div>
      )}

      {/* Hero */}
      <div className="rounded-2xl border bg-card/80 p-6 backdrop-blur">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{trip.coverEmoji}</span>
          <div>
            <h2 className="text-2xl font-bold text-primary">{trip.destination}</h2>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
              <span>{getDaysUntil(trip)}</span>
            </div>
            {trip.accommodation.name && (
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Hotel className="h-3.5 w-3.5" /> {trip.accommodation.name}
                {trip.accommodation.confirmationNo && <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">#{trip.accommodation.confirmationNo}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Duration", value: `${getTripDuration(trip)} days` },
          { label: "Activities", value: totalActivities.toString() },
          { label: "Expenses", value: trip.expenses.length.toString() },
          { label: "Packed", value: total > 0 ? `${Math.round((packed / total) * 100)}%` : "—" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border bg-card/80 p-4 text-center backdrop-blur">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-lg font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Budget */}
      <div className="rounded-2xl border bg-card/80 p-6 backdrop-blur">
        <h3 className="mb-4 font-semibold text-primary flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Budget
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{trip.budget.total.toLocaleString()} {trip.budget.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium text-coral">{spent.toLocaleString()} {trip.budget.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className={`font-medium ${remaining < 0 ? "text-destructive" : "text-green-600"}`}>
                  {remaining.toLocaleString()} {trip.budget.currency}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${budgetPct > 100 ? "bg-destructive" : budgetPct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={EXPENSE_COLORS[d.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${trip.budget.currency}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Add expense */}
        <div className="mt-4">
          {!showExpForm ? (
            <button onClick={() => setShowExpForm(true)} className="flex items-center gap-1 text-sm text-secondary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add Expense
            </button>
          ) : (
            <div className="rounded-xl border bg-muted/50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                <select value={expCat} onChange={(e) => setExpCat(e.target.value)}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary">
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="activity">Activity</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input placeholder="Description" value={expDesc} onChange={(e) => setExpDesc(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
              <input type="number" placeholder="Amount" value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
              <div className="flex gap-2">
                <button onClick={addExpense} className="rounded-lg bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">Save</button>
                <button onClick={() => setShowExpForm(false)} className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Expense list */}
        {trip.expenses.length > 0 && (
          <div className="mt-4 space-y-2">
            {trip.expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EXPENSE_COLORS[e.category] }} />
                  <span>{e.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{e.amount.toLocaleString()} {trip.budget.currency}</span>
                  <button onClick={() => removeExpense(e.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete trip */}
      <button
        onClick={() => setConfirmDeleteTrip(true)}
        className="flex items-center gap-2 text-sm text-destructive hover:underline"
      >
        <Trash2 className="h-4 w-4" /> Delete This Trip
      </button>

      <ConfirmDialog
        open={confirmDeleteTrip}
        title="Delete Trip"
        message="Delete this trip permanently? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteTrip(trip.id); setConfirmDeleteTrip(false); }}
        onCancel={() => setConfirmDeleteTrip(false)}
      />
    </div>
  );
}
