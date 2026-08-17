import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarRating } from "@/components/StarRating";
import { ImageOff } from "lucide-react";
import type { ItemType, ItemStatus } from "@/types/cinema";

interface AddTitleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    title: string;
    type: ItemType;
    posterUrl: string;
    status: ItemStatus;
    personalRating: number;
    review: string;
  }) => void;
}

export function AddTitleModal({ open, onOpenChange, onAdd }: AddTitleModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ItemType>("Movie");
  const [posterUrl, setPosterUrl] = useState("");
  const [status, setStatus] = useState<ItemStatus>("To Watch");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const reset = () => {
    setTitle(""); setType("Movie"); setPosterUrl(""); setStatus("To Watch"); setRating(0); setReview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), type, posterUrl: posterUrl.trim(), status, personalRating: rating, review });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-glow-purple">Add New Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Movie or series name..." className="bg-muted border-border" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as ItemType)}>
                    <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Movie">Movie</SelectItem>
                      <SelectItem value="Series">Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
                    <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To Watch">To Watch</SelectItem>
                      <SelectItem value="Watching">Watching</SelectItem>
                      <SelectItem value="Watched">Watched</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Poster URL</Label>
                <Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://..." className="bg-muted border-border" />
              </div>
            </div>
            <div className="w-28 shrink-0">
              <Label className="text-xs">Preview</Label>
              <div className="aspect-[2/3] rounded-md overflow-hidden bg-muted border border-border mt-1">
                {posterUrl ? (
                  <img src={posterUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label>Rating</Label>
            <StarRating rating={rating} onRate={setRating} />
          </div>
          <div>
            <Label>Review (optional)</Label>
            <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Your thoughts..." className="bg-muted border-border min-h-[60px]" />
          </div>
          <Button type="submit" className="w-full" disabled={!title.trim()}>
            Add to Vault
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
