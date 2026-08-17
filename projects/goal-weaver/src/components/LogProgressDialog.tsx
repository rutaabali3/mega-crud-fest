import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import type { Goal } from "@/types/goal";
import { cn } from "@/lib/utils";

interface Props {
  goal: Goal;
  onLog: (goalId: string, amount: number, date: string, note?: string) => void;
  trigger?: React.ReactNode;
}

export function LogProgressDialog({ goal, onLog, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");

  const reset = () => { setAmount(""); setDate(new Date()); setNote(""); };

  const handleSubmit = () => {
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return;
    onLog(goal.id, a, format(date, "yyyy-MM-dd"), note || undefined);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" /> Log
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Progress – {goal.title}</DialogTitle>
          <DialogDescription>Add progress in {goal.unit} towards your goal.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount ({goal.unit})</Label>
              <Input type="number" min="0.01" step="any" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea placeholder="What did you accomplish?" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground" disabled={!amount || parseFloat(amount) <= 0}>Log Progress</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
