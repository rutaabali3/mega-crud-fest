import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { WishItem, Currency, Priority, Occasion } from "@/types/wishlist";
import { CURRENCIES, OCCASIONS, PRIORITY_CONFIG } from "@/types/wishlist";

interface AddEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<WishItem>) => void;
  editItem?: WishItem | null;
  people: string[];
}

export function AddEditModal({ open, onClose, onSave, editItem, people }: AddEditModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [priority, setPriority] = useState<Priority>("medium");
  const [forPerson, setForPerson] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("Birthday");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [claimedBy, setClaimedBy] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [shaking, setShaking] = useState(false);
  const [personSearch, setPersonSearch] = useState("");
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editItem;

  useEffect(() => {
    if (open && editItem) {
      setName(editItem.name);
      setUrl(editItem.url || "");
      setPrice(String(editItem.price));
      setCurrency(editItem.currency);
      setPriority(editItem.priority);
      setForPerson(editItem.forPerson);
      setOccasion(editItem.occasion);
      setNotes(editItem.notes || "");
      setImageUrl(editItem.imageUrl || "");
      setClaimedBy(editItem.claimedBy || "");
      setPurchased(editItem.purchased);
      setShowNotes(!!editItem.notes);
    } else if (open) {
      setName("");
      setUrl("");
      setPrice("");
      setCurrency("USD");
      setPriority("medium");
      setForPerson("");
      setOccasion("Birthday");
      setNotes("");
      setImageUrl("");
      setClaimedBy("");
      setPurchased(false);
      setShowNotes(false);
    }
    setErrors([]);
  }, [open, editItem]);

  useEffect(() => {
    if (open && !editItem) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, editItem]);

  const handleUrlBlur = () => {
    if (url && !imageUrl) {
      try {
        const domain = new URL(url).hostname;
        setImageUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      } catch {}
    }
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("name");
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.push("price");
    if (!forPerson.trim()) errs.push("forPerson");

    if (errs.length) {
      setErrors(errs);
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
      return;
    }

    onSave({
      ...(editItem ? { id: editItem.id } : {}),
      name: name.trim(),
      url: url.trim() || undefined,
      price: Number(price),
      currency,
      priority,
      forPerson: forPerson.trim(),
      occasion,
      notes: notes.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      claimedBy: claimedBy.trim() || undefined,
      claimed: !!claimedBy.trim() || editItem?.claimed || false,
      purchased,
    });
    onClose();
  };

  const filteredPeople = people.filter(
    (p) => p.toLowerCase().includes(personSearch.toLowerCase()) && p !== forPerson
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Wish" : "Add a Wish"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of your wish item." : "Add something special to your wishlist."}
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 ${shaking ? "animate-shake" : ""}`}>
          {/* Name */}
          <div>
            <Label htmlFor="wish-name">Item Name *</Label>
            <Input
              id="wish-name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AirPods Pro"
              className={errors.includes("name") ? "border-destructive" : ""}
            />
          </div>

          {/* URL */}
          <div>
            <Label htmlFor="wish-url">URL</Label>
            <Input
              id="wish-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://..."
            />
            {imageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={imageUrl} alt="Preview" className="h-8 w-8 rounded object-contain" />
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            )}
          </div>

          {/* Price + Currency */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="wish-price">Price *</Label>
              <Input
                id="wish-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className={errors.includes("price") ? "border-destructive" : ""}
              />
            </div>
            <div className="w-24">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.symbol} {c.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label>Priority *</Label>
            <div className="flex gap-2 mt-1">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-full py-1.5 px-3 text-sm font-medium transition-all border ${
                    priority === p
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  {PRIORITY_CONFIG[p].dot} {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Person combobox */}
          <div className="relative">
            <Label htmlFor="wish-person">Who is it for? *</Label>
            <Input
              id="wish-person"
              value={forPerson}
              onChange={(e) => {
                setForPerson(e.target.value);
                setPersonSearch(e.target.value);
                setShowPersonDropdown(true);
              }}
              onFocus={() => setShowPersonDropdown(true)}
              onBlur={() => setTimeout(() => setShowPersonDropdown(false), 150)}
              placeholder="Type a name..."
              className={errors.includes("forPerson") ? "border-destructive" : ""}
            />
            {showPersonDropdown && filteredPeople.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                {filteredPeople.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={() => {
                      setForPerson(p);
                      setShowPersonDropdown(false);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Occasion */}
          <div>
            <Label>Occasion *</Label>
            <Select value={occasion} onValueChange={(v) => setOccasion(v as Occasion)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((o) => (
                  <SelectItem key={o.label} value={o.label}>
                    {o.emoji} {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          {!showNotes && !isEdit ? (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-sm text-primary hover:underline"
            >
              + Add notes
            </button>
          ) : (
            <div>
              <Label htmlFor="wish-notes">Notes</Label>
              <Textarea
                id="wish-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                rows={3}
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <Label htmlFor="wish-image">Image (optional, max 20MB)</Label>
            <input
              id="wish-image"
              type="file"
              accept="image/*"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 20 * 1024 * 1024) {
                  setErrors((prev) => [...prev, "image"]);
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => setImageUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
            {errors.includes("image") && (
              <p className="text-xs text-destructive mt-1">File must be under 20MB</p>
            )}
            {imageUrl && (
              <div className="mt-2 relative inline-block">
                <img src={imageUrl} alt="Preview" className="h-20 w-20 rounded-lg object-cover border" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Edit-only fields */}
          {isEdit && (
            <>
              <div>
                <Label htmlFor="wish-claimed-by">Claimed by</Label>
                <Input
                  id="wish-claimed-by"
                  value={claimedBy}
                  onChange={(e) => setClaimedBy(e.target.value)}
                  placeholder="Name of person who claimed this"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={purchased} onCheckedChange={setPurchased} id="wish-purchased" />
                <Label htmlFor="wish-purchased">Mark as Purchased</Label>
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {isEdit ? "Update Wish" : "Add Wish ✨"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
