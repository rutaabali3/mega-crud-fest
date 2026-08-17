import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Ruler } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Measurement } from "@/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Measurements() {
  const { measurements, setMeasurements, settings } = useWorkout();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    unit: settings.weightUnit,
    bodyFat: "",
    chest: "",
    waist: "",
    hips: "",
    biceps: "",
    thighs: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight) return;
    const entry: Measurement = {
      id: crypto.randomUUID(),
      date: new Date(form.date).toISOString(),
      weight: parseFloat(form.weight),
      unit: form.unit as "kg" | "lbs",
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : null,
      chest: form.chest ? parseFloat(form.chest) : null,
      waist: form.waist ? parseFloat(form.waist) : null,
      hips: form.hips ? parseFloat(form.hips) : null,
      biceps: form.biceps ? parseFloat(form.biceps) : null,
      thighs: form.thighs ? parseFloat(form.thighs) : null,
      notes: form.notes,
    };
    setMeasurements([...measurements, entry]);
    setForm({ ...form, weight: "", bodyFat: "", chest: "", waist: "", hips: "", biceps: "", thighs: "", notes: "" });
  };

  const handleDelete = () => {
    if (deleteId) {
      setMeasurements(measurements.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    }
  };

  const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sorted.map((m) => ({
    date: format(parseISO(m.date), "MMM d"),
    weight: m.weight,
  }));

  const reversed = [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <TopBar title="Measurements" />

      {/* Form */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Log Measurement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-input border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Body Weight ({form.unit})</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, unit: form.unit === "kg" ? "lbs" : "kg" })}
                    className="shrink-0 text-xs"
                  >
                    {form.unit}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Body Fat %</label>
                <Input type="number" step="0.1" placeholder="–" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} className="bg-input border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Chest (cm)</label>
                <Input type="number" step="0.1" placeholder="–" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} className="bg-input border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Waist (cm)</label>
                <Input type="number" step="0.1" placeholder="–" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} className="bg-input border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Hips (cm)</label>
                <Input type="number" step="0.1" placeholder="–" value={form.hips} onChange={(e) => setForm({ ...form, hips: e.target.value })} className="bg-input border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Biceps (cm)</label>
                <Input type="number" step="0.1" placeholder="–" value={form.biceps} onChange={(e) => setForm({ ...form, biceps: e.target.value })} className="bg-input border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Thighs (cm)</label>
                <Input type="number" step="0.1" placeholder="–" value={form.thighs} onChange={(e) => setForm({ ...form, thighs: e.target.value })} className="bg-input border-border" />
              </div>
            </div>
            <Textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-input border-border" />
            <Button type="submit" className="rounded-full font-bold">Save Measurement</Button>
          </form>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Body Weight Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Ruler className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>Log your first measurement to see weight trends</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent>
          {reversed.length > 0 ? (
            <div className="space-y-2">
              {reversed.map((m, i) => {
                const prevM = reversed[i + 1];
                const diff = prevM ? m.weight - prevM.weight : 0;
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      diff < 0 ? "bg-success/5 border border-success/20" : diff > 0 ? "bg-destructive/5 border border-destructive/20" : "bg-secondary/50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {m.weight} {m.unit}
                        {diff !== 0 && (
                          <span className={`ml-2 text-xs ${diff < 0 ? "text-success" : "text-destructive"}`}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(m.date), "EEE, MMM d yyyy")}
                        {m.bodyFat ? ` · ${m.bodyFat}% BF` : ""}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(m.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No measurements logged yet</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Measurement</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
