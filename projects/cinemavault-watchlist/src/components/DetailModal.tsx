import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/StarRating";
import { Trash2, ImageOff, Eye } from "lucide-react";
import type { CinemaItem, ItemStatus } from "@/types/cinema";

interface DetailModalProps {
  item: CinemaItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<CinemaItem>) => void;
  onDelete: (id: string) => void;
}

export function DetailModal({ item, open, onOpenChange, onUpdate, onDelete }: DetailModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ItemStatus>("To Watch");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  const loadItem = (i: CinemaItem) => {
    setTitle(i.title); setStatus(i.status); setRating(i.personalRating); setReview(i.review); setPosterUrl(i.posterUrl);
  };

  if (item && title === "" && open) loadItem(item);

  const handleSave = () => {
    if (!item) return;
    onUpdate(item.id, { title, status, personalRating: rating, review, posterUrl });
    onOpenChange(false);
    resetLocal();
  };

  const handleDelete = () => {
    if (!item) return;
    onDelete(item.id);
    onOpenChange(false);
    resetLocal();
  };

  const resetLocal = () => { setTitle(""); setStatus("To Watch"); setRating(0); setReview(""); setPosterUrl(""); };

  const handleOpenChange = (v: boolean) => {
    if (!v) resetLocal();
    onOpenChange(v);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-glow-purple">Title Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-full sm:w-48 shrink-0">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted border border-border">
              {posterUrl ? (
                <img src={posterUrl} alt={title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageOff className="h-10 w-10" />
                </div>
              )}
            </div>
            <Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="Poster URL" className="mt-2 bg-muted border-border text-xs" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted border-border" />
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
            <div>
              <Label>Rating</Label>
              <StarRating rating={rating} onRate={setRating} />
            </div>
            <div>
              <Label>Review</Label>
              <Textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Your thoughts..." className="bg-muted border-border min-h-[80px]" />
            </div>
            <div className="flex gap-2 pt-2">
              {status !== "Watched" && (
                <Button variant="secondary" size="sm" onClick={() => { setStatus("Watched"); }} className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Mark as Watched
                </Button>
              )}
              <Button onClick={handleSave} size="sm">Save Changes</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-auto gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{item.title}"?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
