import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SymptomEntry, Medication, SYMPTOM_SUGGESTIONS, SEVERITY_LABELS } from "@/types";
import { format, parseISO } from "@/utils/dateHelpers";
import { Plus, Search, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SymptomsPageProps {
  symptoms: SymptomEntry[];
  medications: Medication[];
  onAdd: (entry: Omit<SymptomEntry, "id" | "createdAt">) => void;
  onUpdate: (id: string, updates: Partial<SymptomEntry>) => void;
  onDelete: (id: string) => void;
}

export default function SymptomsPage({ symptoms, medications, onAdd, onUpdate, onDelete }: SymptomsPageProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SymptomEntry | null>(null);
  const [deleting, setDeleting] = useState<SymptomEntry | null>(null);

  // Form state
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [date, setDate] = useState<Date>(new Date());
  const [linkedMeds, setLinkedMeds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const activeMeds = medications.filter((m) => m.isActive);

  const filtered = useMemo(() => {
    return [...symptoms]
      .filter((s) => s.symptom.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [symptoms, search]);

  const openForm = (entry?: SymptomEntry) => {
    if (entry) {
      setEditing(entry);
      setSymptom(entry.symptom);
      setSeverity(entry.severity);
      setDate(new Date(entry.date));
      setLinkedMeds(entry.linkedMedicationIds);
      setNotes(entry.notes || "");
    } else {
      setEditing(null);
      setSymptom("");
      setSeverity(3);
      setDate(new Date());
      setLinkedMeds([]);
      setNotes("");
    }
    setFormOpen(true);
  };

  const handleSave = () => {
    const data = {
      symptom,
      severity,
      date: format(date, "yyyy-MM-dd"),
      linkedMedicationIds: linkedMeds,
      notes: notes || undefined,
    };

    if (editing) {
      onUpdate(editing.id, data);
      toast({ title: "🧪 Symptom updated" });
    } else {
      onAdd(data);
      toast({ title: "🧪 Symptom logged" });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deleting) {
      onDelete(deleting.id);
      toast({ title: "Symptom deleted" });
      setDeleting(null);
    }
  };

  const getMed = (id: string) => medications.find((m) => m.id === id);

  const toggleMed = (id: string) => {
    setLinkedMeds((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Symptoms Journal</h1>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" /> Log Symptom
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search symptoms..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-card border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No symptoms logged yet</p>
          <Button className="mt-4 bg-primary" onClick={() => openForm()}>
            <Plus className="h-4 w-4 mr-2" /> Log your first symptom
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="bg-card border-border rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{s.symptom}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={`text-xs ${i <= s.severity ? "text-warning" : "text-muted"}`}>★</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">({SEVERITY_LABELS[s.severity]})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(parseISO(s.date), "MMMM d, yyyy")}</p>
                    {s.linkedMedicationIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.linkedMedicationIds.map((id) => {
                          const med = getMed(id);
                          if (!med) return null;
                          return (
                            <Badge key={id} variant="outline" className="text-[10px]" style={{ borderColor: med.color + "60", color: med.color }}>
                              {med.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openForm(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleting(s)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Symptom" : "Log Symptom"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Symptom</Label>
              <Select value={SYMPTOM_SUGGESTIONS.includes(symptom) ? symptom : "Other"} onValueChange={(v) => {
                if (v === "Other") setSymptom("");
                else setSymptom(v);
              }}>
                <SelectTrigger><SelectValue placeholder="Select symptom" /></SelectTrigger>
                <SelectContent>
                  {SYMPTOM_SUGGESTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!SYMPTOM_SUGGESTIONS.includes(symptom)) && (
                <Input value={symptom} onChange={(e) => setSymptom(e.target.value)} placeholder="Describe symptom..." className="mt-2" />
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Severity</Label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSeverity(i)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                      severity === i
                        ? "bg-warning/20 text-warning border-warning/50"
                        : "bg-muted/50 text-muted-foreground border-border hover:border-warning/30"
                    }`}
                  >
                    {i} ★
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">{SEVERITY_LABELS[severity]}</p>
            </div>

            <div className="space-y-1.5">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            {activeMeds.length > 0 && (
              <div className="space-y-1.5">
                <Label>Linked Medications</Label>
                <div className="space-y-2">
                  {activeMeds.map((med) => (
                    <div key={med.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`med-${med.id}`}
                        checked={linkedMeds.includes(med.id)}
                        onCheckedChange={() => toggleMed(med.id)}
                      />
                      <label htmlFor={`med-${med.id}`} className="text-sm flex items-center gap-2 cursor-pointer">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: med.color }} />
                        {med.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." rows={2} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" disabled={!symptom} onClick={handleSave}>
                {editing ? "Update" : "Log"} Symptom
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete symptom entry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
