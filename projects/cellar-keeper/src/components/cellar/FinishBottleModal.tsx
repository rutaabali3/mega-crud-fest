import { useState, useCallback } from "react";
import { Bottle } from "@/types/bottle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface FinishBottleModalProps {
  open: boolean;
  onClose: () => void;
  bottle: Bottle | null;
  onFinish: (id: string, drankOn: string, note: string, removeAll: boolean) => void;
}

export function FinishBottleModal({ open, onClose, bottle, onFinish }: FinishBottleModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [showQuantityChoice, setShowQuantityChoice] = useState(false);

  const handleConfirm = useCallback((removeAll: boolean) => {
    if (!bottle) return;
    onFinish(bottle.id, date.toISOString(), note, removeAll);
    toast.success(`🍾 Cheers! ${bottle.name} logged as finished on ${date.toLocaleDateString()}`);
    setNote("");
    setShowQuantityChoice(false);
    onClose();
  }, [bottle, date, note, onFinish, onClose]);

  const handleInitialConfirm = useCallback(() => {
    if (!bottle) return;
    if (bottle.quantity > 1) {
      setShowQuantityChoice(true);
    } else {
      handleConfirm(true);
    }
  }, [bottle, handleConfirm]);

  if (!bottle) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="glass-card sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display">🍾 Enjoyed this bottle?</DialogTitle>
          <DialogDescription>Log when you drank "{bottle.name}"</DialogDescription>
        </DialogHeader>

        {!showQuantityChoice ? (
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Final tasting note (optional)</Label>
              <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How was it?" rows={3} />
            </div>
            <Button onClick={handleInitialConfirm} className="w-full bg-primary text-primary-foreground">
              Confirm
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You have {bottle.quantity} bottles. Remove how many?</p>
            <div className="flex gap-3">
              <Button onClick={() => handleConfirm(false)} variant="outline" className="flex-1">
                Remove 1 bottle
              </Button>
              <Button onClick={() => handleConfirm(true)} className="flex-1 bg-primary text-primary-foreground">
                Remove all {bottle.quantity}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
