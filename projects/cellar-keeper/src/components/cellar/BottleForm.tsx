import { useState, useCallback, useEffect } from "react";
import { Bottle, BottleType, BOTTLE_TYPES, TYPE_ICONS, getRatingLabel } from "@/types/bottle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface BottleFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (bottle: Bottle) => void;
  onDelete?: (id: string) => void;
  editBottle?: Bottle | null;
}

function emptyBottle(): Omit<Bottle, "id" | "dateAdded"> {
  return {
    name: "", type: "Red Wine", vintage: new Date().getFullYear(), region: "",
    pricePaid: 0, rating: 80, locationInCellar: "", photoUrl: "",
    quantity: 1, drinkByDate: "", tastingNotes: "", drankOn: null, isFinished: false,
  };
}

export function BottleForm({ open, onClose, onSave, onDelete, editBottle }: BottleFormProps) {
  const [form, setForm] = useState(emptyBottle());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drinkByDate, setDrinkByDate] = useState<Date | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editBottle) {
      setForm({ ...editBottle });
      setDrinkByDate(editBottle.drinkByDate ? new Date(editBottle.drinkByDate) : undefined);
    } else {
      setForm(emptyBottle());
      setDrinkByDate(undefined);
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [editBottle, open]);

  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: "" }));
  }, []);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.vintage < 1800 || form.vintage > new Date().getFullYear()) e.vintage = "Invalid year";
    if (form.pricePaid < 0) e.pricePaid = "Invalid price";
    if (form.quantity < 1) e.quantity = "Min 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    const bottle: Bottle = {
      ...form,
      id: editBottle?.id || crypto.randomUUID(),
      dateAdded: editBottle?.dateAdded || new Date().toISOString(),
      drinkByDate: drinkByDate ? drinkByDate.toISOString() : "",
    };
    onSave(bottle);
    toast.success(editBottle ? `"${bottle.name}" updated` : `"${bottle.name}" added to cellar`);
    onClose();
  }, [form, drinkByDate, editBottle, validate, onSave, onClose]);

  const handleDelete = useCallback(() => {
    if (editBottle && onDelete) {
      onDelete(editBottle.id);
      toast.success(`"${editBottle.name}" removed permanently`);
      onClose();
    }
  }, [editBottle, onDelete, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card max-h-[90vh] overflow-y-auto sm:max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{editBottle ? "Edit Bottle" : "Add Bottle"}</DialogTitle>
          <DialogDescription>
            {editBottle ? "Update the details of your bottle." : "Add a new bottle to your cellar."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Name */}
          <div>
            <Label htmlFor="name">Bottle Name *</Label>
            <Input id="name" value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Château Margaux" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Type + Vintage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => updateField("type", v as BottleType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BOTTLE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{TYPE_ICONS[t]} {t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vintage">Vintage *</Label>
              <Input id="vintage" type="number" min={1800} max={new Date().getFullYear()} value={form.vintage} onChange={e => updateField("vintage", parseInt(e.target.value) || 0)} />
              {errors.vintage && <p className="text-xs text-destructive mt-1">{errors.vintage}</p>}
            </div>
          </div>

          {/* Region + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="region">Region</Label>
              <Input id="region" value={form.region} onChange={e => updateField("region", e.target.value)} placeholder="Bordeaux, France" />
            </div>
            <div>
              <Label htmlFor="price">Price Paid ($)</Label>
              <Input id="price" type="number" step="0.01" min={0} value={form.pricePaid} onChange={e => updateField("pricePaid", parseFloat(e.target.value) || 0)} />
              {errors.pricePaid && <p className="text-xs text-destructive mt-1">{errors.pricePaid}</p>}
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label>Rating: {form.rating} — {getRatingLabel(form.rating)}</Label>
            <Slider value={[form.rating]} min={0} max={100} step={1} onValueChange={v => updateField("rating", v[0])} className="mt-2" />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location in Cellar</Label>
            <Input id="location" value={form.locationInCellar} onChange={e => updateField("locationInCellar", e.target.value)} placeholder="Rack A, Shelf 3" />
          </div>

          {/* Photo */}
          <div>
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 20 * 1024 * 1024) {
                  toast.error("Image must be under 20MB");
                  return;
                }
                // Compress image to fit localStorage
                const img = new Image();
                const reader = new FileReader();
                reader.onload = () => {
                  img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX = 400;
                    let w = img.width, h = img.height;
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else { w = Math.round(w * MAX / h); h = MAX; }
                    canvas.width = w;
                    canvas.height = h;
                    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                    const compressed = canvas.toDataURL("image/jpeg", 0.6);
                    updateField("photoUrl", compressed);
                  };
                  img.src = reader.result as string;
                };
                reader.readAsDataURL(file);
              }}
              className="cursor-pointer"
            />
            {form.photoUrl && (
              <div className="mt-2 relative inline-block">
                <img src={form.photoUrl} alt="Preview" className="h-20 w-20 rounded-md object-cover border border-border" />
                <button type="button" onClick={() => updateField("photoUrl", "")} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center" aria-label="Remove photo">×</button>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantity</Label>
            <div className="flex items-center gap-3 mt-1">
              <Button type="button" size="icon" variant="outline" onClick={() => updateField("quantity", Math.max(1, form.quantity - 1))} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></Button>
              <span className="text-lg font-semibold w-8 text-center">{form.quantity}</span>
              <Button type="button" size="icon" variant="outline" onClick={() => updateField("quantity", form.quantity + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></Button>
            </div>
            {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
          </div>

          {/* Drink By Date */}
          <div>
            <Label>Drink By Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !drinkByDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {drinkByDate ? format(drinkByDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={drinkByDate} onSelect={setDrinkByDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tasting Notes */}
          <div>
            <Label htmlFor="notes">Tasting Notes</Label>
            <Textarea id="notes" value={form.tastingNotes} onChange={e => updateField("tastingNotes", e.target.value)} placeholder="Aromas of blackberry, cedar..." rows={3} />
          </div>
        </div>

        <div className="flex justify-between pt-2">
          {editBottle && onDelete && (
            <div>
              {showDeleteConfirm ? (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-destructive">Are you sure?</span>
                  <Button size="sm" variant="destructive" onClick={handleDelete}>Yes, delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="text-destructive">
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editBottle ? "Update" : "Add Bottle"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
