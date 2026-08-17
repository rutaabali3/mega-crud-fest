import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format, parseISO, differenceInDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePetCare } from '@/contexts/PetCareContext';
import { SPECIES_EMOJIS, MED_COLORS, type Medication, type MedFrequency } from '@/lib/types';
import { formatDate, isMedActive, getMedProgress } from '@/lib/pet-utils';
import { motion } from 'framer-motion';

const FREQ_OPTIONS: { value: MedFrequency; label: string }[] = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'every_8h', label: 'Every 8 hours' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
];

const emptyMed = { petId: '', name: '', dosage: '', frequency: 'once_daily' as MedFrequency, startDate: '', endDate: '', prescribingVet: '', purpose: '', colorTag: MED_COLORS[0] };

export default function MedicationsPage() {
  const { pets, medications, setMedications } = usePetCare();
  const activePets = pets.filter(p => !p.archived);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [form, setForm] = useState(emptyMed);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const activeMeds = medications.filter(m => isMedActive(m));
  const pastMeds = medications.filter(m => !isMedActive(m));

  const openAdd = () => { setForm(emptyMed); setEditing(null); setShowForm(true); };
  const openEdit = (m: Medication) => { setForm({ petId: m.petId, name: m.name, dosage: m.dosage, frequency: m.frequency, startDate: m.startDate, endDate: m.endDate, prescribingVet: m.prescribingVet, purpose: m.purpose, colorTag: m.colorTag }); setEditing(m); setShowForm(true); };

  const save = () => {
    if (!form.petId || !form.name) return;
    if (editing) {
      setMedications(prev => prev.map(m => m.id === editing.id ? { ...m, ...form } : m));
    } else {
      setMedications(prev => [...prev, { ...form, id: crypto.randomUUID(), doses: [], createdAt: new Date().toISOString() } as Medication]);
    }
    setShowForm(false);
  };

  const deleteMed = () => { if (deletingId) { setMedications(prev => prev.filter(m => m.id !== deletingId)); setDeletingId(null); } };

  const logDose = (medId: string) => {
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, doses: [...m.doses, { id: crypto.randomUUID(), timestamp: new Date().toISOString() }] } : m));
  };

  const endCourse = (medId: string) => {
    setMedications(prev => prev.map(m => m.id === medId ? { ...m, endDate: new Date().toISOString().split('T')[0] } : m));
  };

  const DateField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start text-left rounded-xl', !value && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />{value ? format(parseISO(value), 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={value ? parseISO(value) : undefined} onSelect={d => onChange(d ? d.toISOString().split('T')[0] : '')} className="p-3 pointer-events-auto" /></PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medications 💊</h1>
        <Button onClick={openAdd} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Medication</Button>
      </div>

      {activeMeds.length === 0 && pastMeds.length === 0 ? (
        <div className="text-center py-16"><p className="text-5xl mb-4">💊</p><h2 className="text-xl font-semibold mb-2">No medications</h2><p className="text-muted-foreground">Add medications to track doses and reminders.</p></div>
      ) : (
        <>
          {/* Active Meds */}
          <div className="space-y-3">
            {activeMeds.map((med, i) => {
              const pet = pets.find(p => p.id === med.petId);
              const progress = getMedProgress(med);
              const daysLeft = med.endDate ? Math.max(0, differenceInDays(parseISO(med.endDate), new Date())) : null;
              const todayDoses = med.doses.filter(d => d.timestamp.startsWith(format(new Date(), 'yyyy-MM-dd')));
              return (
                <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="rounded-2xl overflow-hidden" style={{ borderLeft: `4px solid ${med.colorTag}` }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{med.name}</h3>
                            <Badge variant="secondary" className="text-xs">{pet?.name}</Badge>
                            <Badge variant="outline" className="text-xs">{FREQ_OPTIONS.find(f => f.value === med.frequency)?.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{med.dosage}</p>
                          {med.purpose && <p className="text-xs text-muted-foreground mt-1">{med.purpose}</p>}
                          {progress >= 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Course progress</span>
                                <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Today: {todayDoses.length} dose{todayDoses.length !== 1 ? 's' : ''} logged</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => logDose(med.id)}><Check className="h-3 w-3" /> Log Dose</Button>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(med)}><Edit2 className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(med.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => endCourse(med.id)}>End Course</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Past Meds */}
          {pastMeds.length > 0 && (
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between rounded-xl">
                  <span>History ({pastMeds.length})</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', historyOpen && 'rotate-180')} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {pastMeds.map(med => {
                  const pet = pets.find(p => p.id === med.petId);
                  return (
                    <Card key={med.id} className="rounded-xl opacity-60">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-1 h-8 rounded-full" style={{ background: med.colorTag }} />
                        <span className="text-lg">{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{med.name} — {pet?.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(med.startDate)} → {formatDate(med.endDate)} • {med.doses.length} doses</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingId(med.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Medication</DialogTitle><DialogDescription>Enter medication details.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Pet *</Label>
              <Select value={form.petId} onValueChange={v => setForm(f => ({ ...f, petId: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Medication Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} className="rounded-xl" placeholder="e.g., 10mg" /></div>
            <div><Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as MedFrequency }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{FREQ_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DateField label="Start Date" value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} />
            <DateField label="End Date (optional)" value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} />
            <div><Label>Prescribing Vet</Label><Input value={form.prescribingVet} onChange={e => setForm(f => ({ ...f, prescribingVet: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Purpose/Notes</Label><Textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} className="rounded-xl" /></div>
            <div>
              <Label>Color Tag</Label>
              <div className="flex gap-2 mt-1">
                {MED_COLORS.map(c => (
                  <button key={c} className={cn('h-7 w-7 rounded-full border-2 transition-all', form.colorTag === c ? 'border-foreground scale-110' : 'border-transparent')} style={{ background: c }} onClick={() => setForm(f => ({ ...f, colorTag: c }))} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={save} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle>Delete medication?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteMed} className="rounded-xl bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
