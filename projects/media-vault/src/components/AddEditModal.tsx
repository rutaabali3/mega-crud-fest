import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "./StarRating";
import { MediaItem, MediaType, MediaStatus, CREATOR_LABELS, PROGRESS_LABELS } from "@/lib/types";
import { Book, Film, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<MediaItem, "id" | "dateAdded">) => void;
  editItem?: MediaItem | null;
}

const typeOptions: { value: MediaType; label: string; icon: React.ElementType }[] = [
  { value: "book", label: "Book", icon: Book },
  { value: "movie", label: "Movie", icon: Film },
  { value: "game", label: "Game", icon: Gamepad2 },
];

const defaultForm = { type: "book" as MediaType, title: "", creator: "", rating: 6, status: "want" as MediaStatus, review: "", progress: { current: 0, total: 0 }, imageUrl: "" };

export function AddEditModal({ open, onClose, onSave, editItem }: Props) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editItem) setForm({ type: editItem.type, title: editItem.title, creator: editItem.creator, rating: editItem.rating, status: editItem.status, review: editItem.review, progress: { ...editItem.progress }, imageUrl: editItem.imageUrl });
    else setForm(defaultForm);
  }, [editItem, open]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(prev => ({ ...prev, [k]: v }));
  const pLabels = PROGRESS_LABELS[form.type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div className="flex gap-2">
            {typeOptions.map(t => (
              <button key={t.value} type="button" onClick={() => set("type", t.value)}
                className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all",
                  form.type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Enter title…" required />
          </div>

          <div className="space-y-1.5">
            <Label>{CREATOR_LABELS[form.type]}</Label>
            <Input value={form.creator} onChange={e => set("creator", e.target.value)} placeholder={`Enter ${CREATOR_LABELS[form.type].toLowerCase()}…`} />
          </div>

          <div className="space-y-1.5">
            <Label>Image URL (optional)</Label>
            <Input value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} placeholder="https://…" />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-4">
              <Slider value={[form.rating]} onValueChange={v => set("rating", v[0])} min={1} max={10} step={1} className="flex-1" />
              <StarRating rating={form.rating} size="md" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v as MediaStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="want">Want to Consume</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{pLabels.current}</Label>
              <Input type="number" min={0} value={form.progress.current} onChange={e => set("progress", { ...form.progress, current: +e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{pLabels.total}</Label>
              <Input type="number" min={0} value={form.progress.total} onChange={e => set("progress", { ...form.progress, total: +e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Review (optional)</Label>
            <Textarea value={form.review} onChange={e => set("review", e.target.value)} rows={3} placeholder="Your thoughts…" />
          </div>

          <Button type="submit" className="w-full">{editItem ? "Save Changes" : "Add to Library"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
