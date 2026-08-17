import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCraft } from "@/context/CraftContext";
import { PROJECT_TYPES, TYPE_COLORS, UNIT_OPTIONS, Material } from "@/types/craft";
import { ProgressRing } from "@/components/ProgressRing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Plus, Trash2, ExternalLink, Check, Clock } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, completeProject, addSession, deleteSession, updateMaterials, updateProgress, hourlyRate } = useCraft();

  const project = projects.find((p) => p.id === id);

  // Session form
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [sessionHours, setSessionHours] = useState("");
  const [sessionNote, setSessionNote] = useState("");

  // Inline edit states
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>Go Back</Button>
      </div>
    );
  }

  const materialsCost = project.materials.reduce((s, m) => s + m.costPaid, 0);
  const labourCost = project.totalHoursSpent * hourlyRate;
  const totalCost = materialsCost + labourCost;
  const profit = project.estimatedSellingPrice ? project.estimatedSellingPrice - totalCost : null;
  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.type);

  const handleSaveTitle = () => {
    if (titleDraft.trim()) {
      updateProject({ ...project, title: titleDraft.trim() });
    }
    setEditingTitle(false);
  };

  const handleLogSession = () => {
    if (!sessionHours) return;
    addSession(project.id, { date: sessionDate.toISOString(), hoursLogged: Number(sessionHours), note: sessionNote });
    toast({ title: "Session logged! ⏱️" });
    setSessionHours("");
    setSessionNote("");
    setSessionDate(new Date());
  };

  const handleAddMaterial = () => {
    updateMaterials(project.id, [...project.materials, { id: uuid(), name: "", quantity: "", costPaid: 0, unit: "pieces" }]);
  };

  const handleUpdateMaterial = (matId: string, field: keyof Material, value: string | number) => {
    updateMaterials(project.id, project.materials.map((m) => m.id === matId ? { ...m, [field]: value } : m));
  };

  const handleRemoveMaterial = (matId: string) => {
    updateMaterials(project.id, project.materials.filter((m) => m.id !== matId));
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="h-32 w-32 rounded-2xl bg-muted overflow-hidden shrink-0">
          {project.photoURL ? (
            <img src={project.photoURL} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-accent">{typeInfo?.emoji}</div>
          )}
        </div>
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="font-display text-xl font-bold" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()} />
              <Button size="sm" onClick={handleSaveTitle}><Check className="h-4 w-4" /></Button>
            </div>
          ) : (
            <h1 className="font-display text-2xl font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => { setEditingTitle(true); setTitleDraft(project.title); }}>
              {project.title}
            </h1>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className={cn(TYPE_COLORS[project.type])}>
              {typeInfo?.emoji} {typeInfo?.label}
            </Badge>
            <Badge variant={project.status === "completed" ? "default" : "secondary"}>
              {project.status.toUpperCase()}
            </Badge>
            {project.patternURL && (
              <a href={project.patternURL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3" /> Pattern
              </a>
            )}
          </div>
        </div>
        <ProgressRing progress={project.progress} size={80} strokeWidth={6} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="costs">Cost & Profit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-card rounded-2xl border p-4 space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Progress</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider
                    value={[project.progress]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => updateProgress(project.id, v)}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold w-10 text-right">{project.progress}%</span>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Photo URL</Label>
                <Input value={project.photoURL} onChange={(e) => updateProject({ ...project, photoURL: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Pattern URL</Label>
                <Input value={project.patternURL} onChange={(e) => updateProject({ ...project, patternURL: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Selling Price ($)</Label>
                <Input type="number" value={project.estimatedSellingPrice || ""} onChange={(e) => updateProject({ ...project, estimatedSellingPrice: Number(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>
            <div className="bg-card rounded-2xl border p-4 space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Start Date</Label>
                <p className="text-sm">{format(new Date(project.startDate), "PPP")}</p>
              </div>
              {project.targetEndDate && (
                <div>
                  <Label className="text-muted-foreground text-xs">Target End Date</Label>
                  <p className="text-sm">{format(new Date(project.targetEndDate), "PPP")}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Total Hours</Label>
                <p className="text-lg font-semibold">{project.totalHoursSpent.toFixed(1)}h</p>
              </div>
              {project.status === "wip" && project.progress < 100 && (
                <Button onClick={() => { completeProject(project.id); toast({ title: "Project completed! 🎉" }); }} className="w-full">
                  <Check className="h-4 w-4 mr-1" /> Mark as Completed
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="bg-card rounded-2xl border p-4 mb-4">
            <h3 className="font-display font-semibold mb-3">Log New Session</h3>
            <div className="flex flex-wrap gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(sessionDate, "MMM d")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={sessionDate} onSelect={(d) => d && setSessionDate(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="number" step="0.25" placeholder="Hours" value={sessionHours} onChange={(e) => setSessionHours(e.target.value)} className="w-24 h-9" />
              <Textarea placeholder="Notes..." value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} className="flex-1 min-w-[200px] h-9 resize-none" rows={1} />
              <Button onClick={handleLogSession} disabled={!sessionHours} size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-1" /> Log
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {[...project.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((s) => (
              <div key={s.id} className="flex items-start gap-3 bg-card rounded-xl border p-3">
                <div className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                  {format(new Date(s.date), "MMM d")}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <Clock className="h-3 w-3 mr-1" />{s.hoursLogged}h
                </Badge>
                <p className="text-sm flex-1">{s.note || <span className="text-muted-foreground italic">No notes</span>}</p>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => { deleteSession(project.id, s.id); toast({ title: "Session removed" }); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {project.sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No sessions logged yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="materials">
          <div className="space-y-2">
            {project.materials.map((m) => (
              <div key={m.id} className="flex items-center gap-2 bg-card rounded-xl border p-2">
                <Input placeholder="Material" value={m.name} onChange={(e) => handleUpdateMaterial(m.id, "name", e.target.value)} className="flex-1 h-8 text-sm" />
                <Input placeholder="Qty" value={m.quantity} onChange={(e) => handleUpdateMaterial(m.id, "quantity", e.target.value)} className="w-16 h-8 text-sm" />
                <Select value={m.unit} onValueChange={(v) => handleUpdateMaterial(m.id, "unit", v)}>
                  <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
                <div className="relative w-20">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input type="number" value={m.costPaid || ""} onChange={(e) => handleUpdateMaterial(m.id, "costPaid", Number(e.target.value))} className="pl-5 h-8 text-sm" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveMaterial(m.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddMaterial} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Add Material
            </Button>
            {project.materials.length > 0 && (
              <div className="text-right text-sm font-medium">Total: ${materialsCost.toFixed(2)}</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="costs">
          <div className="bg-card rounded-2xl border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Materials Cost</p>
                <p className="text-lg font-semibold">${materialsCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Labour Cost ({project.totalHoursSpent.toFixed(1)}h × ${hourlyRate}/hr)</p>
                <p className="text-lg font-semibold">${labourCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Total Cost</p>
                <p className="text-lg font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Selling Price</p>
                <p className="text-lg font-semibold">{project.estimatedSellingPrice ? `$${project.estimatedSellingPrice.toFixed(2)}` : "—"}</p>
              </div>
            </div>
            {profit !== null && (
              <div className={cn("rounded-lg p-3 text-center", profit >= 0 ? "bg-craft-sage/10" : "bg-destructive/10")}>
                <p className="text-xs text-muted-foreground">Profit / Loss</p>
                <p className={cn("text-2xl font-bold", profit >= 0 ? "text-craft-sage" : "text-destructive")}>
                  {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
