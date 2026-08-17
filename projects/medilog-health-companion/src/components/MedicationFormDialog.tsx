import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Medication, FrequencyType, MEDICATION_COLORS } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  onSave: (data: Omit<Medication, "id" | "createdAt">) => void;
}

const FREQUENCY_TIME_DEFAULTS: Record<FrequencyType, string[]> = {
  daily: ["09:00"],
  twice_daily: ["08:00", "20:00"],
  three_times: ["08:00", "14:00", "20:00"],
  weekly: ["09:00"],
  as_needed: [],
  custom: ["09:00"],
};

export function MedicationFormDialog({ open, onOpenChange, medication, onSave }: MedicationFormDialogProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [customFrequency, setCustomFrequency] = useState("");
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(["09:00"]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [ongoing, setOngoing] = useState(true);
  const [prescriber, setPrescriber] = useState("");
  const [pillsPerDose, setPillsPerDose] = useState(1);
  const [totalPills, setTotalPills] = useState<number | undefined>();
  const [refillReminderDays, setRefillReminderDays] = useState(7);
  const [color, setColor] = useState(MEDICATION_COLORS[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      setFrequency(medication.frequency);
      setCustomFrequency(medication.customFrequency || "");
      setScheduleTimes(medication.scheduleTimes);
      setStartDate(new Date(medication.startDate));
      setEndDate(medication.endDate ? new Date(medication.endDate) : undefined);
      setOngoing(!medication.endDate);
      setPrescriber(medication.prescriber);
      setPillsPerDose(medication.pillsPerDose);
      setTotalPills(medication.totalPills);
      setRefillReminderDays(medication.refillReminderDays);
      setColor(medication.color);
      setNotes(medication.notes || "");
    } else {
      setName("");
      setDosage("");
      setFrequency("daily");
      setCustomFrequency("");
      setScheduleTimes(["09:00"]);
      setStartDate(new Date());
      setEndDate(undefined);
      setOngoing(true);
      setPrescriber("");
      setPillsPerDose(1);
      setTotalPills(undefined);
      setRefillReminderDays(7);
      setColor(MEDICATION_COLORS[0]);
      setNotes("");
    }
  }, [medication, open]);

  const handleFrequencyChange = (val: FrequencyType) => {
    setFrequency(val);
    setScheduleTimes(FREQUENCY_TIME_DEFAULTS[val] || ["09:00"]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      dosage,
      frequency,
      customFrequency: frequency === "custom" ? customFrequency : undefined,
      scheduleTimes,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: ongoing ? undefined : endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      prescriber,
      color,
      notes: notes || undefined,
      refillReminderDays,
      pillsPerDose,
      totalPills,
      isActive: medication?.isActive ?? true,
    });
  };

  const valid = name && dosage && prescriber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medication ? "Edit Medication" : "Add Medication"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Metformin" />
            </div>
            <div className="space-y-1.5">
              <Label>Dosage *</Label>
              <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500mg" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => handleFrequencyChange(v as FrequencyType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="twice_daily">Twice Daily</SelectItem>
                <SelectItem value="three_times">Three Times Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="as_needed">As Needed</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {frequency === "custom" && (
              <Input value={customFrequency} onChange={(e) => setCustomFrequency(e.target.value)} placeholder="e.g., Every 4 hours" className="mt-2" />
            )}
          </div>

          {frequency !== "as_needed" && (
            <div className="space-y-1.5">
              <Label>Schedule Times</Label>
              <div className="space-y-2">
                {scheduleTimes.map((time, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input type="time" value={time} onChange={(e) => {
                      const updated = [...scheduleTimes];
                      updated[i] = e.target.value;
                      setScheduleTimes(updated);
                    }} className="flex-1" />
                    {scheduleTimes.length > 1 && (
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setScheduleTimes(scheduleTimes.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setScheduleTimes([...scheduleTimes, "12:00"])}>
                  <Plus className="h-3 w-3 mr-1" /> Add Time
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label>End Date</Label>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Checkbox id="ongoing" checked={ongoing} onCheckedChange={(c) => setOngoing(!!c)} />
                  <label htmlFor="ongoing" className="text-xs text-muted-foreground">Ongoing</label>
                </div>
              </div>
              {!ongoing && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={(d) => setEndDate(d || undefined)} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prescriber *</Label>
            <Input value={prescriber} onChange={(e) => setPrescriber(e.target.value)} placeholder="Dr. Smith" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Pills per dose</Label>
              <Input type="number" min={1} value={pillsPerDose} onChange={(e) => setPillsPerDose(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1.5">
              <Label>Total pills (bottle)</Label>
              <Input type="number" min={0} value={totalPills ?? ""} onChange={(e) => setTotalPills(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Optional" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Refill reminder: {refillReminderDays} days before end</Label>
            <Slider value={[refillReminderDays]} onValueChange={([v]) => setRefillReminderDays(v)} min={3} max={14} step={1} />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {MEDICATION_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn("h-8 w-8 rounded-lg transition-all duration-200", color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105")}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid} className="bg-primary hover:bg-primary/90">
              {medication ? "Update" : "Add"} Medication
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
