import React, { useState } from "react";
import { Trip, PackingCategory, PackingItem } from "@/types/trip";
import {
  generateId, getPackingProgress, getPackingTemplate, PRESET_CATEGORY_COLORS,
} from "@/lib/tripUtils";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Star, Printer, RotateCcw, X,
} from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

interface Props {
  trip: Trip;
  updateTrip: (t: Trip) => void;
}

export default function PackingTab({ trip, updateTrip }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemEssential, setItemEssential] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_CATEGORY_COLORS[0]);
  const [showTemplates, setShowTemplates] = useState(false);

  const { packed, total } = getPackingProgress(trip);
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

  const togglePacked = (catId: string, itemId: string) => {
    updateTrip({
      ...trip,
      packingCategories: trip.packingCategories.map((c) =>
        c.id === catId ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, packed: !i.packed } : i)) } : c
      ),
    });
  };

  const addItem = (catId: string) => {
    if (!itemName.trim()) return;
    const item: PackingItem = { id: generateId(), name: itemName, quantity: parseInt(itemQty) || 1, packed: false, essential: itemEssential };
    updateTrip({
      ...trip,
      packingCategories: trip.packingCategories.map((c) =>
        c.id === catId ? { ...c, items: [...c.items, item] } : c
      ),
    });
    setItemName("");
    setItemQty("1");
    setItemEssential(false);
    setAddingTo(null);
  };

  const deleteItem = (catId: string, itemId: string) => {
    updateTrip({
      ...trip,
      packingCategories: trip.packingCategories.map((c) =>
        c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      ),
    });
  };

  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [confirmClearPacked, setConfirmClearPacked] = useState(false);

  const deleteCategory = () => {
    if (!confirmDeleteCat) return;
    updateTrip({ ...trip, packingCategories: trip.packingCategories.filter((c) => c.id !== confirmDeleteCat) });
    setConfirmDeleteCat(null);
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const cat: PackingCategory = { id: generateId(), name: newCatName, color: newCatColor, items: [] };
    updateTrip({ ...trip, packingCategories: [...trip.packingCategories, cat] });
    setNewCatName("");
    setShowNewCat(false);
  };

  const applyTemplate = (key: string) => {
    const cats = getPackingTemplate(key);
    updateTrip({ ...trip, packingCategories: [...trip.packingCategories, ...cats] });
    setShowTemplates(false);
  };

  const uncheckAll = () => {
    updateTrip({
      ...trip,
      packingCategories: trip.packingCategories.map((c) => ({
        ...c,
        items: c.items.map((i) => ({ ...i, packed: false })),
      })),
    });
  };

  const clearPacked = () => {
    updateTrip({
      ...trip,
      packingCategories: trip.packingCategories.map((c) => ({
        ...c,
        items: c.items.filter((i) => !i.packed),
      })),
    });
    setConfirmClearPacked(false);
  };

  const handlePrint = () => window.print();

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const TEMPLATES = [
    { key: "default", label: "✈️ Standard", },
    { key: "beach", label: "🏖️ Beach Trip" },
    { key: "business", label: "💼 Business" },
    { key: "mountain", label: "🏔️ Mountain Hike" },
    { key: "city", label: "🏙️ City Break" },
    { key: "camping", label: "⛺ Camping" },
    { key: "roadtrip", label: "🚗 Road Trip" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-primary">Packing List</h2>
          <p className="text-sm text-muted-foreground">{packed} of {total} items packed</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={handlePrint} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button onClick={uncheckAll} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-muted">
            <RotateCcw className="h-3.5 w-3.5" /> Uncheck All
          </button>
          <button onClick={() => setConfirmClearPacked(true)} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" /> Clear Packed
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Categories */}
      {trip.packingCategories.map((cat) => {
        const catPacked = cat.items.filter((i) => i.packed).length;
        const isOpen = expanded[cat.id] !== false;
        return (
          <div key={cat.id} className="rounded-xl border bg-card/80 backdrop-blur overflow-hidden">
            <button
              onClick={() => toggle(cat.id)}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50"
            >
              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span className="flex-1 font-medium text-sm">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{catPacked}/{cat.items.length} packed</span>
              <button onClick={(e) => { e.stopPropagation(); setAddingTo(addingTo === cat.id ? null : cat.id); }}
                className="rounded p-1 hover:bg-muted no-print"><Plus className="h-3.5 w-3.5 text-secondary" /></button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteCat(cat.id); }}
                className="rounded p-1 hover:bg-destructive/10 no-print"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
            </button>

            {isOpen && (
              <div className="border-t px-4 pb-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => togglePacked(cat.id, item.id)}
                      className="h-4 w-4 rounded border-input accent-secondary"
                    />
                    <span className={`flex-1 text-sm ${item.packed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">×{item.quantity}</span>
                    )}
                    {item.essential && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                    <button onClick={() => deleteItem(cat.id, item.id)} className="rounded p-1 hover:bg-destructive/10 no-print">
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}

                {addingTo === cat.id && (
                  <div className="mt-2 flex flex-wrap items-end gap-2 no-print">
                    <input placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)}
                      className="flex-1 min-w-[120px] rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                    <input type="number" placeholder="Qty" value={itemQty} onChange={(e) => setItemQty(e.target.value)}
                      className="w-16 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
                    <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={itemEssential} onChange={(e) => setItemEssential(e.target.checked)}
                        className="accent-yellow-500" /> Essential
                    </label>
                    <button onClick={() => addItem(cat.id)} className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">Add</button>
                    <button onClick={() => setAddingTo(null)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add category & templates */}
      <div className="flex flex-wrap gap-2 no-print">
        {!showNewCat ? (
          <button onClick={() => setShowNewCat(true)} className="flex items-center gap-1 rounded-xl border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border bg-muted/50 p-3 w-full">
            <input placeholder="Category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary" />
            <div className="flex gap-1">
              {PRESET_CATEGORY_COLORS.map((c) => (
                <button key={c} onClick={() => setNewCatColor(c)}
                  className={`h-6 w-6 rounded-full transition-all ${newCatColor === c ? "ring-2 ring-offset-2 ring-secondary" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <button onClick={addCategory} className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">Add</button>
            <button onClick={() => setShowNewCat(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="relative">
          <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-1 rounded-xl border border-dashed px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            📋 Use Template
          </button>
          {showTemplates && (
            <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border bg-popover p-1 shadow-lg z-10">
              {TEMPLATES.map((t) => (
                <button key={t.key} onClick={() => applyTemplate(t.key)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">{t.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDeleteCat}
        title="Delete Category"
        message="Delete this category and all its items?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={deleteCategory}
        onCancel={() => setConfirmDeleteCat(null)}
      />
      <ConfirmDialog
        open={confirmClearPacked}
        title="Clear Packed Items"
        message="Remove all packed items? This cannot be undone."
        confirmLabel="Clear"
        variant="warning"
        onConfirm={clearPacked}
        onCancel={() => setConfirmClearPacked(false)}
      />
    </div>
  );
}
