import React, { useState } from "react";
import { Trip } from "@/types/trip";
import ConfirmDialog from "./ConfirmDialog";
import {
  generateId, getDestinationEmoji, getTripStatus, getDaysUntil,
  getTripDuration, getPackingProgress, formatDateShort, generateItinerary,
} from "@/lib/tripUtils";
import {
  Plus, MoreVertical, MapPin, Calendar, Luggage, DollarSign,
  Copy, Trash2, Edit, ChevronLeft, ChevronRight, X,
} from "lucide-react";

interface Props {
  trips: Trip[];
  setTrips: (v: Trip[] | ((p: Trip[]) => Trip[])) => void;
  onOpenTrip: (id: string) => void;
  onDeleteTrip: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-secondary/15 text-secondary",
  ONGOING: "bg-green-100 text-green-700",
  COMPLETED: "bg-muted text-muted-foreground",
};

export default function MyTrips({ trips, setTrips, onOpenTrip, onDeleteTrip }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const duplicateTrip = (trip: Trip) => {
    const dup: Trip = {
      ...JSON.parse(JSON.stringify(trip)),
      id: generateId(),
      destination: trip.destination + " (Copy)",
      startDate: "",
      endDate: "",
      itinerary: [],
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [...prev, dup]);
    setMenuOpen(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    setMenuOpen(null);
  };

  if (trips.length === 0 && !showCreate) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-in">
        <div className="text-8xl mb-6">🗺️</div>
        <h1 className="mb-2 text-2xl font-bold text-primary">No trips planned yet</h1>
        <p className="mb-6 text-muted-foreground">Start planning your next adventure</p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-coral px-6 py-3 font-semibold text-accent-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          Plan Your First Trip ✈️
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">My Trips</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {trips.map((trip) => {
          const status = getTripStatus(trip);
          const { packed, total } = getPackingProgress(trip);
          const packPct = total > 0 ? Math.round((packed / total) * 100) : 0;
          const spent = trip.expenses.reduce((s, e) => s + e.amount, 0);
          const budgetPct = trip.budget.total > 0 ? Math.round((spent / trip.budget.total) * 100) : 0;

          return (
            <div
              key={trip.id}
              className="group relative rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Menu */}
              <div className="absolute right-3 top-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === trip.id ? null : trip.id); }}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpen === trip.id && (
                  <div className="absolute right-0 mt-1 w-40 rounded-xl border bg-popover p-1 shadow-lg z-10">
                    <button onClick={() => { setEditingTrip(trip); setShowCreate(true); setMenuOpen(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => duplicateTrip(trip)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </button>
                    <button onClick={() => handleDelete(trip.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-3 flex items-start gap-3">
                <span className="text-4xl">{trip.coverEmoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-primary">{trip.destination}</h3>
                  {trip.startDate && trip.endDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)} · {getTripDuration(trip)} days
                    </div>
                  )}
                </div>
              </div>

              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
                {status}
              </span>
              {trip.startDate && (
                <span className="ml-2 text-xs text-muted-foreground">{getDaysUntil(trip)}</span>
              )}

              {/* Progress bars */}
              <div className="mt-3 space-y-2">
                {total > 0 && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Luggage className="h-3 w-3" /> Packing</span>
                      <span>{packPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${packPct}%` }} />
                    </div>
                  </div>
                )}
                {trip.budget.total > 0 && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Budget</span>
                      <span>{spent.toLocaleString()} / {trip.budget.total.toLocaleString()} {trip.budget.currency}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${budgetPct > 100 ? "bg-destructive" : budgetPct > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(budgetPct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onOpenTrip(trip.id)}
                className="mt-4 w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Trip
              </button>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingTrip(null); setShowCreate(true); }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-accent-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Create/Edit Modal */}
      {showCreate && (
        <CreateTripModal
          existingTrip={editingTrip}
          onClose={() => { setShowCreate(false); setEditingTrip(null); }}
          onSave={(trip) => {
            if (editingTrip) {
              setTrips((prev) => prev.map((t) => (t.id === trip.id ? trip : t)));
            } else {
              setTrips((prev) => [...prev, trip]);
            }
            setShowCreate(false);
            setEditingTrip(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { onDeleteTrip(confirmDeleteId!); setConfirmDeleteId(null); }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

function CreateTripModal({
  existingTrip,
  onClose,
  onSave,
}: {
  existingTrip: Trip | null;
  onClose: () => void;
  onSave: (trip: Trip) => void;
}) {
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState(existingTrip?.destination || "");
  const [startDate, setStartDate] = useState(existingTrip?.startDate || "");
  const [endDate, setEndDate] = useState(existingTrip?.endDate || "");
  const [accName, setAccName] = useState(existingTrip?.accommodation.name || "");
  const [accAddress, setAccAddress] = useState(existingTrip?.accommodation.address || "");
  const [accConf, setAccConf] = useState(existingTrip?.accommodation.confirmationNo || "");
  const [budget, setBudget] = useState(existingTrip?.budget.total?.toString() || "");
  const [currency, setCurrency] = useState(existingTrip?.budget.currency || "USD");
  const [notes, setNotes] = useState(existingTrip?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!dest.trim()) e.dest = "Destination is required";
      if (!startDate) e.startDate = "Start date is required";
      if (!endDate) e.endDate = "End date is required";
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) e.endDate = "End date must be after start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep((s) => s + 1); };
  const handleBack = () => setStep((s) => s - 1);

  const handleSave = () => {
    const trip: Trip = {
      id: existingTrip?.id || generateId(),
      destination: dest,
      coverEmoji: getDestinationEmoji(dest),
      startDate,
      endDate,
      accommodation: { name: accName, address: accAddress, confirmationNo: accConf },
      budget: { total: parseFloat(budget) || 0, currency, spent: existingTrip?.budget.spent || 0 },
      itinerary: existingTrip?.itinerary || generateItinerary(startDate, endDate),
      packingCategories: existingTrip?.packingCategories || [],
      expenses: existingTrip?.expenses || [],
      notes,
      createdAt: existingTrip?.createdAt || new Date().toISOString(),
    };
    onSave(trip);
  };

  const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "BRL", "KRW", "SGD", "THB"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">
            {existingTrip ? "Edit Trip" : "New Trip"} — Step {step}/3
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-secondary" : "bg-muted"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <input
                placeholder="Where are you going?"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary"
              />
              {errors.dest && <p className="mt-1 text-xs text-destructive">{errors.dest}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input placeholder="Hotel / Airbnb name" value={accName} onChange={(e) => setAccName(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary" />
            <input placeholder="Address" value={accAddress} onChange={(e) => setAccAddress(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary" />
            <input placeholder="Confirmation number" value={accConf} onChange={(e) => setAccConf(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Total Budget</label>
                <input type="number" placeholder="0" value={budget} onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary">
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary" rows={3} />
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button onClick={handleBack} className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={handleNext} className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSave} className="rounded-xl bg-coral px-5 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90">
              {existingTrip ? "Save Changes" : "Create Trip ✈️"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
