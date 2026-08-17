import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Medication, FrequencyType, MEDICATION_COLORS } from "@/types";
import { format, parseISO } from "@/utils/dateHelpers";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { MedicationFormDialog } from "@/components/MedicationFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const FREQ_LABELS: Record<FrequencyType, string> = {
  daily: "Daily",
  twice_daily: "Twice Daily",
  three_times: "3× Daily",
  weekly: "Weekly",
  as_needed: "As Needed",
  custom: "Custom",
};

interface MedicationsPageProps {
  medications: Medication[];
  onAdd: (med: Omit<Medication, "id" | "createdAt">) => void;
  onUpdate: (id: string, updates: Partial<Medication>) => void;
  onDelete: (id: string) => void;
}

export default function MedicationsPage({ medications, onAdd, onUpdate, onDelete }: MedicationsPageProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deletingMed, setDeletingMed] = useState<Medication | null>(null);

  const filtered = useMemo(() => {
    return medications
      .filter((m) => {
        if (filter === "active") return m.isActive;
        if (filter === "inactive") return !m.isActive;
        return true;
      })
      .filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.prescriber.toLowerCase().includes(search.toLowerCase())
      );
  }, [medications, search, filter]);

  const handleSave = (data: Omit<Medication, "id" | "createdAt">) => {
    if (editingMed) {
      onUpdate(editingMed.id, data);
      toast({ title: "💊 Medication updated", description: data.name });
    } else {
      onAdd(data);
      toast({ title: "💊 Medication added", description: data.name });
    }
    setEditingMed(null);
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (deletingMed) {
      onDelete(deletingMed.id);
      toast({ title: "🗑️ Medication deleted", description: deletingMed.name });
      setDeletingMed(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => { setEditingMed(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Medication
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medications..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="bg-card border-border rounded-2xl p-12 text-center">
          <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No medications found</p>
          <Button className="mt-4 bg-primary" onClick={() => { setEditingMed(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add your first medication
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((med) => (
            <Card key={med.id} className="bg-card border-border rounded-2xl hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: med.color + "20" }}>
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: med.color }} />
                    </div>
                    <div>
                      <p className="font-semibold">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                  </div>
                  <Badge variant={med.isActive ? "default" : "secondary"} className={med.isActive ? "bg-success/20 text-success border-success/30" : ""}>
                    {med.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{FREQ_LABELS[med.frequency]} • {med.scheduleTimes.map((t) => {
                    const [h, m] = t.split(":");
                    const hr = parseInt(h);
                    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
                  }).join(", ")}</p>
                  <p>{med.prescriber}</p>
                  <p>
                    {format(parseISO(med.startDate), "MMM d, yyyy")}
                    {med.endDate ? ` → ${format(parseISO(med.endDate), "MMM d, yyyy")}` : " → Ongoing"}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => { setEditingMed(med); setFormOpen(true); }}>
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeletingMed(med)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <MedicationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        medication={editingMed}
        onSave={handleSave}
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingMed} onOpenChange={() => setDeletingMed(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingMed?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all dose logs for {deletingMed?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Pill({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 1.5 3 3L5 13l-3-3a2.12 2.12 0 0 1 3-3l5.5-5.5Z" />
      <path d="m13.5 6.5 3 3" />
      <path d="m19 1.5-3 3 3 3 3-3-3-3Z" />
    </svg>
  );
}
