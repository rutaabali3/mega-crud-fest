import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PROJECT_TYPES, UNIT_OPTIONS, ProjectType, Material } from "@/types/craft";
import { useCraft } from "@/context/CraftContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const { addProject } = useCraft();
  const [step, setStep] = useState(1);

  // Step 1
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProjectType>("knitting");
  const [photoURL, setPhotoURL] = useState("");
  const [patternURL, setPatternURL] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [targetEndDate, setTargetEndDate] = useState<Date | undefined>();
  const [sellingPrice, setSellingPrice] = useState("");
  const [titleError, setTitleError] = useState("");

  // Step 2
  const [materials, setMaterials] = useState<Material[]>([]);

  const reset = () => {
    setStep(1);
    setTitle("");
    setType("knitting");
    setPhotoURL("");
    setPatternURL("");
    setStartDate(new Date());
    setTargetEndDate(undefined);
    setSellingPrice("");
    setMaterials([]);
    setTitleError("");
  };

  const addMaterialRow = () => {
    setMaterials([...materials, { id: uuid(), name: "", quantity: "", costPaid: 0, unit: "pieces" }]);
  };

  const updateMaterial = (id: string, field: keyof Material, value: string | number) => {
    setMaterials(materials.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const materialsCost = materials.reduce((sum, m) => sum + (m.costPaid || 0), 0);

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim()) {
        setTitleError("Project title is required");
        return;
      }
      setTitleError("");
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSave = () => {
    addProject({
      title: title.trim(),
      type,
      status: "wip",
      photoURL,
      patternURL,
      progress: 0,
      startDate: startDate.toISOString(),
      targetEndDate: targetEndDate?.toISOString() || "",
      materials: materials.filter((m) => m.name.trim()),
      sessions: [],
      estimatedSellingPrice: Number(sellingPrice) || 0,
    });
    toast({ title: "Project created! 🎉", description: `"${title}" has been added to your WIP board.` });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {step === 1 ? "New Project — Basics" : step === 2 ? "Materials List" : "Review & Save"}
          </DialogTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1 flex-1 rounded-full", s <= step ? "bg-primary" : "bg-muted")} />
            ))}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => { setTitle(e.target.value); setTitleError(""); }} placeholder="My cozy scarf" />
              {titleError && <p className="text-xs text-destructive mt-1">{titleError}</p>}
            </div>
            <div>
              <Label>Project Type</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors",
                      type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent"
                    )}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Photo URL</Label>
                <Input value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Pattern URL</Label>
                <Input value={patternURL} onChange={(e) => setPatternURL(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            {photoURL && (
              <div className="h-24 w-24 rounded-lg overflow-hidden border">
                <img src={photoURL} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Target End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !targetEndDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetEndDate ? format(targetEndDate, "PPP") : "Optional"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={targetEndDate} onSelect={setTargetEndDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label>Estimated Selling Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" className="pl-7" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 mt-2">
            {materials.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No materials added yet. Click below to add some.</p>
            )}
            {materials.map((m) => (
              <div key={m.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Input placeholder="Material" value={m.name} onChange={(e) => updateMaterial(m.id, "name", e.target.value)} className="flex-1 h-8 text-sm" />
                <Input placeholder="Qty" value={m.quantity} onChange={(e) => updateMaterial(m.id, "quantity", e.target.value)} className="w-16 h-8 text-sm" />
                <Select value={m.unit} onValueChange={(v) => updateMaterial(m.id, "unit", v)}>
                  <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="relative w-20">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input type="number" value={m.costPaid || ""} onChange={(e) => updateMaterial(m.id, "costPaid", Number(e.target.value))} className="pl-5 h-8 text-sm" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeMaterial(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMaterialRow} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Material
            </Button>
            {materials.length > 0 && (
              <div className="text-right text-sm font-medium text-foreground">
                Total: ${materialsCost.toFixed(2)}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 mt-2">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-medium">{title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{PROJECT_TYPES.find(t => t.value === type)?.emoji} {PROJECT_TYPES.find(t => t.value === type)?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{format(startDate, "PPP")}</span></div>
              {targetEndDate && <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span>{format(targetEndDate, "PPP")}</span></div>}
              {Number(sellingPrice) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Selling Price</span><span>${sellingPrice}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Materials</span><span>{materials.filter(m => m.name).length} items (${materialsCost.toFixed(2)})</span></div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          ) : <div />}
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Save Project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
