import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StarRating } from "./StarRating";
import { StatusBadge } from "./StatusBadge";
import { MediaItem, MediaStatus, CREATOR_LABELS, PROGRESS_LABELS } from "@/lib/types";
import { Book, Film, Gamepad2, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeIcons = { book: Book, movie: Film, game: Gamepad2 };

interface Props {
  item: MediaItem | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<MediaItem>) => void;
  onDelete: (id: string) => void;
  onMarkFinished: (id: string) => void;
}

export function DetailModal({ item, open, onClose, onUpdate, onDelete, onMarkFinished }: Props) {
  const { toast } = useToast();
  if (!item) return null;

  const Icon = typeIcons[item.type];
  const pLabels = PROGRESS_LABELS[item.type];
  const pct = item.progress.total > 0 ? Math.round((item.progress.current / item.progress.total) * 100) : 0;

  const update = (updates: Partial<MediaItem>) => {
    onUpdate(item.id, updates);
    toast({ title: "Updated!", description: `${item.title} has been updated.` });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <DialogTitle className="flex-1">{item.title}</DialogTitle>
            <StatusBadge status={item.status} />
          </div>
        </DialogHeader>

        {/* Cover */}
        {item.imageUrl && (
          <div className="rounded-lg overflow-hidden aspect-video">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-5">
          {/* Creator */}
          <div className="space-y-1.5">
            <Label>{CREATOR_LABELS[item.type]}</Label>
            <Input value={item.creator} onChange={e => update({ creator: e.target.value })} />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-4">
              <Slider value={[item.rating]} onValueChange={v => update({ rating: v[0] })} min={1} max={10} step={1} className="flex-1" />
              <StarRating rating={item.rating} size="md" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={item.status} onValueChange={v => update({ status: v as MediaStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="want">Want to Consume</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{pLabels.current}</Label>
                <Input type="number" min={0} value={item.progress.current}
                  onChange={e => update({ progress: { ...item.progress, current: +e.target.value } })} />
              </div>
              <div className="space-y-1.5">
                <Label>{pLabels.total}</Label>
                <Input type="number" min={0} value={item.progress.total}
                  onChange={e => update({ progress: { ...item.progress, total: +e.target.value } })} />
              </div>
            </div>
            {item.progress.total > 0 && (
              <div className="space-y-1">
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-muted-foreground">{pct}% complete</p>
              </div>
            )}
          </div>

          {/* Review */}
          <div className="space-y-1.5">
            <Label>Review</Label>
            <Textarea value={item.review} onChange={e => update({ review: e.target.value })} rows={3} placeholder="Your thoughts…" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {item.status !== "finished" && (
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => { onMarkFinished(item.id); toast({ title: "Marked as finished!", description: item.title }); }}>
                <CheckCircle2 className="w-4 h-4" /> Mark Finished
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{item.title}"?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onDelete(item.id); onClose(); toast({ title: "Deleted", description: `${item.title} removed.` }); }}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <p className="text-[10px] text-muted-foreground">Added {new Date(item.dateAdded).toLocaleDateString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
