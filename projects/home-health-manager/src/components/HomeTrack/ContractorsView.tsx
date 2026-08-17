import React, { useState } from "react";
import { Plus, Edit, Trash2, Star, Phone, Mail, Users } from "lucide-react";
import { Contractor, SPECIALTIES, Specialty } from "@/lib/types";

interface ContractorsViewProps {
  contractors: Contractor[];
  onSave: (c: Contractor) => void;
  onDelete: (id: string) => void;
}

export default function ContractorsView({ contractors, onSave, onDelete }: ContractorsViewProps) {
  const [editing, setEditing] = useState<Contractor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Contractors</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus size={16} /> Add
        </button>
      </div>

      {contractors.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Users size={48} className="mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No contractors yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contractors.map((c) => (
            <div key={c.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {c.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <span className="inline-block rounded-md bg-accent px-1.5 py-0.5 text-xs">{c.specialty}</span>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= c.rating ? "fill-warning text-warning" : "text-muted-foreground/30"} />
                    ))}
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                      <Phone size={12} /> {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Mail size={12} /> {c.email}
                    </a>
                  )}
                  {c.notes && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setShowModal(true); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setConfirmDelete(c.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 font-semibold">Delete this contractor?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
              <button onClick={() => { onDelete(confirmDelete); setConfirmDelete(null); }} className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && <ContractorModal contractor={editing} onClose={() => setShowModal(false)} onSave={(c) => { onSave(c); setShowModal(false); }} />}
    </div>
  );
}

function ContractorModal({ contractor, onClose, onSave }: { contractor: Contractor | null; onClose: () => void; onSave: (c: Contractor) => void }) {
  const [name, setName] = useState(contractor?.name || "");
  const [phone, setPhone] = useState(contractor?.phone || "");
  const [email, setEmail] = useState(contractor?.email || "");
  const [specialty, setSpecialty] = useState<Specialty>(contractor?.specialty || "General");
  const [rating, setRating] = useState(contractor?.rating || 3);
  const [notes, setNotes] = useState(contractor?.notes || "");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: contractor?.id || crypto.randomUUID(),
      name: name.trim(), phone, email, specialty, rating, notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold">{contractor ? "Edit" : "Add"} Contractor</h2>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" type="tel" className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" />
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value as Specialty)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none">
            {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="p-0.5">
                  <Star size={20} className={s <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"} />
                </button>
              ))}
            </div>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none" />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-accent">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save</button>
        </div>
      </div>
    </div>
  );
}
