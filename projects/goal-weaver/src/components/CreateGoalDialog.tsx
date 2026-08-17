import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { UNIT_OPTIONS } from "@/types/goal";
import { cn } from "@/lib/utils";

interface Props {
  onCreate: (data: { title: string; unit: string; target: number; deadline: string }) => void;
}

export function CreateGoalDialog({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("kg");
  const [customUnit, setCustomUnit] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState<Date>();

  const reset = () => {
    setTitle(""); setUnit("kg"); setCustomUnit(""); setTarget(""); setDeadline(undefined);
  };

  const handleSubmit = () => {
    const finalUnit = unit === "custom" ? customUnit.trim() : unit;
    if (!title.trim() || !finalUnit || !target || !deadline) return;
    const t = parseFloat(target);
    if (isNaN(t) || t <= 0) return;
    onCreate({ title: title.trim(), unit: finalUnit, target: t, deadline: format(deadline, "yyyy-MM-dd") });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>Set a target and deadline to start tracking your progress.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="e.g. Save $5,000" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unit === "custom" && (
                <Input placeholder="Custom unit" value={customUnit} onChange={(e) => setCustomUnit(e.target.value)} />
              )}
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <Input type="number" min="0.01" step="any" placeholder="100" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={deadline} onSelect={setDeadline} disabled={(d) => d < new Date(new Date().toDateString())} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground" disabled={!title.trim() || !target || !deadline}>Create Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
