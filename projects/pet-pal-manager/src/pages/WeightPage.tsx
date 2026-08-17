import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePetCare } from '@/contexts/PetCareContext';
import { SPECIES_EMOJIS, type WeightEntry } from '@/lib/types';
import { formatDate } from '@/lib/pet-utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function WeightPage() {
  const { pets, weights, setWeights } = usePetCare();
  const activePets = pets.filter(p => !p.archived);
  const [selectedPet, setSelectedPet] = useState<string>(activePets[0]?.id || 'all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WeightEntry | null>(null);
  const [form, setForm] = useState({ petId: '', weight: 0, unit: 'kg' as 'kg' | 'lbs' | 'g', date: '', notes: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const petWeights = (selectedPet === 'all' ? weights : weights.filter(w => w.petId === selectedPet))
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = petWeights.map(w => ({ date: format(parseISO(w.date), 'MMM d'), weight: w.weight, fullDate: w.date }));

  const openAdd = () => { setForm({ petId: selectedPet !== 'all' ? selectedPet : '', weight: 0, unit: 'kg', date: '', notes: '' }); setEditing(null); setShowForm(true); };
  const openEdit = (w: WeightEntry) => { setForm({ petId: w.petId, weight: w.weight, unit: w.unit, date: w.date, notes: w.notes }); setEditing(w); setShowForm(true); };

  const save = () => {
    if (!form.petId || !form.weight || !form.date) return;
    if (editing) {
      setWeights(prev => prev.map(w => w.id === editing.id ? { ...w, ...form } : w));
    } else {
      setWeights(prev => [...prev, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as WeightEntry]);
    }
    setShowForm(false);
  };

  const deleteWeight = () => { if (deletingId) { setWeights(prev => prev.filter(w => w.id !== deletingId)); setDeletingId(null); } };

  const tableData = [...petWeights].reverse();
  const getChange = (idx: number) => {
    if (idx >= tableData.length - 1) return null;
    return +(tableData[idx].weight - tableData[idx + 1].weight).toFixed(2);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Weight Tracker ⚖️</h1>
        <Button onClick={openAdd} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Log Weight</Button>
      </div>

      <Tabs value={selectedPet} onValueChange={setSelectedPet}>
        <TabsList className="rounded-xl flex-wrap h-auto">
          <TabsTrigger value="all" className="rounded-lg">All Pets</TabsTrigger>
          {activePets.map(p => (
            <TabsTrigger key={p.id} value={p.id} className="rounded-lg">{SPECIES_EMOJIS[p.species]} {p.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {petWeights.length === 0 ? (
        <div className="text-center py-16"><p className="text-5xl mb-4">📊</p><h2 className="text-xl font-semibold mb-2">No weight data yet</h2><p className="text-muted-foreground">Start logging weights to see trends.</p></div>
      ) : (
        <>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-base">Weight Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Pet</TableHead><TableHead>Date</TableHead><TableHead>Weight</TableHead><TableHead>Change</TableHead><TableHead>Notes</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((w, i) => {
                  const pet = pets.find(p => p.id === w.petId);
                  const change = getChange(i);
                  return (
                    <TableRow key={w.id}>
                      <TableCell>{pet ? `${SPECIES_EMOJIS[pet.species]} ${pet.name}` : '?'}</TableCell>
                      <TableCell>{formatDate(w.date)}</TableCell>
                      <TableCell className="font-medium">{w.weight} {w.unit}</TableCell>
                      <TableCell>
                        {change !== null && (
                          <Badge variant={change > 0 ? 'default' : change < 0 ? 'destructive' : 'secondary'} className="text-xs">
                            {change > 0 ? '+' : ''}{change} {w.unit}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{w.notes || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(w)}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(w.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Log'} Weight</DialogTitle><DialogDescription>Enter weight data.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Pet *</Label>
              <Select value={form.petId} onValueChange={v => setForm(f => ({ ...f, petId: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Weight *</Label><Input type="number" step="0.1" value={form.weight || ''} onChange={e => setForm(f => ({ ...f, weight: parseFloat(e.target.value) || 0 }))} className="rounded-xl" /></div>
              <div><Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v as 'kg' | 'lbs' | 'g' }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lbs">lbs</SelectItem><SelectItem value="g">g</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left rounded-xl', !form.date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />{form.date ? format(parseISO(form.date), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={form.date ? parseISO(form.date) : undefined} onSelect={d => setForm(f => ({ ...f, date: d ? d.toISOString().split('T')[0] : '' }))} className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={save} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle>Delete weight entry?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteWeight} className="rounded-xl bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
