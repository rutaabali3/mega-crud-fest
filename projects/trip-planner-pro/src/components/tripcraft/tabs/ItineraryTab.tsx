import React, { useState } from "react";
import { Trip, Activity } from "@/types/trip";
import { generateId, formatDayHeader, getActivityIcon } from "@/lib/tripUtils";
import { Plus, Trash2, Edit, X, Check } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

interface Props {
  trip: Trip;
  updateTrip: (t: Trip) => void;
}

const TYPE_COLORS: Record<string, string> = {
  food: "bg-sky/20 text-sky",
  transport: "bg-purple-100 text-purple-700",
  activity: "bg-green-100 text-green-700",
  hotel: "bg-coral/20 text-coral",
  other: "bg-muted text-muted-foreground",
};

export default function ItineraryTab({ trip, updateTrip }: Props) {
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ time: "09:00", title: "", description: "", type: "activity", cost: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setForm({ time: "09:00", title: "", description: "", type: "activity", cost: "" });
    setAddingDay(null);
    setEditingId(null);
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveActivity = (dayDate: string) => {
    if (!validate()) return;
    const activity: Activity = {
      id: editingId || generateId(),
      time: form.time,
      title: form.title,
      description: form.description,
      type: form.type as any,
      cost: parseFloat(form.cost) || 0,
    };
    const updated = {
      ...trip,
      itinerary: trip.itinerary.map((d) => {
        if (d.date !== dayDate) return d;
        if (editingId) {
          return { ...d, activities: d.activities.map((a) => (a.id === editingId ? activity : a)) };
        }
        return { ...d, activities: [...d.activities, activity].sort((a, b) => a.time.localeCompare(b.time)) };
      }),
    };
    updateTrip(updated);
    resetForm();
  };

  const [confirmDelete, setConfirmDelete] = useState<{ dayDate: string; actId: string } | null>(null);

  const deleteActivity = () => {
    if (!confirmDelete) return;
    updateTrip({
      ...trip,
      itinerary: trip.itinerary.map((d) =>
        d.date === confirmDelete.dayDate ? { ...d, activities: d.activities.filter((a) => a.id !== confirmDelete.actId) } : d
      ),
    });
    setConfirmDelete(null);
  };

  const startEdit = (dayDate: string, act: Activity) => {
    setAddingDay(dayDate);
    setEditingId(act.id);
    setForm({ time: act.time, title: act.title, description: act.description, type: act.type, cost: act.cost.toString() });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-primary">Itinerary</h2>

      {trip.itinerary.map((day) => (
        <div key={day.date} className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />

          <div className="relative">
            <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-secondary" />
            <h3 className="mb-3 font-semibold text-primary">{formatDayHeader(day.date)}</h3>
          </div>

          {day.activities.length === 0 && addingDay !== day.date && (
            <p className="mb-3 text-sm italic text-muted-foreground">Nothing planned — enjoy the freedom 🌿</p>
          )}

          <div className="space-y-2">
            {day.activities.map((act) => (
              <div key={act.id} className="group ml-2 flex items-start gap-3 rounded-xl border bg-card/80 p-3 backdrop-blur transition-all hover:shadow-sm">
                <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${TYPE_COLORS[act.type] || TYPE_COLORS.other}`}>
                  {act.time}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span>{getActivityIcon(act.type)}</span>
                    <span className="font-medium text-sm text-primary">{act.title}</span>
                    {act.cost > 0 && (
                      <span className="ml-auto shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {act.cost.toLocaleString()} {trip.budget.currency}
                      </span>
                    )}
                  </div>
                  {act.description && <p className="mt-1 text-xs text-muted-foreground">{act.description}</p>}
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEdit(day.date, act)} className="rounded p-1 hover:bg-muted"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => setConfirmDelete({ dayDate: day.date, actId: act.id })} className="rounded p-1 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add form */}
          {addingDay === day.date ? (
            <div className="mt-3 ml-2 rounded-xl border bg-muted/50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                </div>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary">
                  <option value="food">🍽️ Food</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="activity">🎭 Activity</option>
                  <option value="hotel">🏨 Hotel</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <div>
                <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
              </div>
              <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" rows={2} />
              <input type="number" placeholder="Cost (optional)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
              <div className="flex gap-2">
                <button onClick={() => saveActivity(day.date)} className="flex items-center gap-1 rounded-lg bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
                <button onClick={resetForm} className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { resetForm(); setAddingDay(day.date); }}
              className="mt-2 ml-2 flex items-center gap-1 text-sm text-secondary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Activity
            </button>
          )}
        </div>
      ))}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Activity"
        message="Are you sure you want to delete this activity?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={deleteActivity}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
