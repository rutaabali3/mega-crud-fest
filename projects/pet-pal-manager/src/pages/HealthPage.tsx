import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePetCare } from '@/contexts/PetCareContext';
import { SPECIES_EMOJIS, type VetVisit, type Vaccination } from '@/lib/types';
import { formatDate, getUpcomingAppointments } from '@/lib/pet-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const emptyVisit = { petId: '', visitDate: '', vetName: '', reason: '', diagnosis: '', treatment: '', cost: 0, nextAppointmentDate: '', attachmentsNote: '' };
const emptyVaccine = { petId: '', vaccineName: '', dateGiven: '', batchNumber: '', vetName: '', nextDueDate: '', notes: '' };

export default function HealthPage() {
  const { pets, vetVisits, setVetVisits, vaccinations, setVaccinations, searchQuery } = usePetCare();
  const activePets = pets.filter(p => !p.archived);
  const [tab, setTab] = useState('visits');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VetVisit | null>(null);
  const [visitForm, setVisitForm] = useState(emptyVisit);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);
  const [filterPet, setFilterPet] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccination | null>(null);
  const [vaccineForm, setVaccineForm] = useState(emptyVaccine);
  const [deletingVaccineId, setDeletingVaccineId] = useState<string | null>(null);

  // Visit CRUD
  const openAddVisit = () => { setVisitForm(emptyVisit); setEditingVisit(null); setShowVisitForm(true); };
  const openEditVisit = (v: VetVisit) => { setVisitForm(v); setEditingVisit(v); setShowVisitForm(true); };
  const saveVisit = () => {
    if (!visitForm.petId || !visitForm.visitDate) return;
    if (editingVisit) {
      setVetVisits(prev => prev.map(v => v.id === editingVisit.id ? { ...v, ...visitForm } : v));
    } else {
      setVetVisits(prev => [...prev, { ...visitForm, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as VetVisit]);
    }
    setShowVisitForm(false);
  };
  const deleteVisit = () => { if (deletingVisitId) { setVetVisits(prev => prev.filter(v => v.id !== deletingVisitId)); setDeletingVisitId(null); } };

  // Vaccine CRUD
  const openAddVaccine = () => { setVaccineForm(emptyVaccine); setEditingVaccine(null); setShowVaccineForm(true); };
  const openEditVaccine = (v: Vaccination) => { setVaccineForm(v); setEditingVaccine(v); setShowVaccineForm(true); };
  const saveVaccine = () => {
    if (!vaccineForm.petId || !vaccineForm.vaccineName) return;
    if (editingVaccine) {
      setVaccinations(prev => prev.map(v => v.id === editingVaccine.id ? { ...v, ...vaccineForm } : v));
    } else {
      setVaccinations(prev => [...prev, { ...vaccineForm, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as Vaccination]);
    }
    setShowVaccineForm(false);
  };
  const deleteVaccine = () => { if (deletingVaccineId) { setVaccinations(prev => prev.filter(v => v.id !== deletingVaccineId)); setDeletingVaccineId(null); } };

  const search = localSearch || searchQuery;
  const filteredVisits = vetVisits
    .filter(v => filterPet === 'all' || v.petId === filterPet)
    .filter(v => !search || v.vetName.toLowerCase().includes(search.toLowerCase()) || v.diagnosis.toLowerCase().includes(search.toLowerCase()) || v.reason.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  const upcomingAppts = getUpcomingAppointments(vetVisits);

  const filteredVaccines = vaccinations
    .filter(v => filterPet === 'all' || v.petId === filterPet)
    .sort((a, b) => b.dateGiven.localeCompare(a.dateGiven));

  const getVaccineStatus = (nextDue: string) => {
    if (!nextDue) return null;
    const d = parseISO(nextDue);
    if (isBefore(d, new Date())) return 'overdue';
    if (isBefore(d, addDays(new Date(), 14))) return 'due-soon';
    return 'ok';
  };

  const DateField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start text-left rounded-xl', !value && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(parseISO(value), 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value ? parseISO(value) : undefined} onSelect={d => onChange(d ? d.toISOString().split('T')[0] : '')} className="p-3 pointer-events-auto" />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Health Records 🏥</h1>

      {/* Upcoming Banner */}
      {upcomingAppts.length > 0 && (
        <Card className="rounded-2xl bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">📅 Upcoming Appointments</h3>
            <div className="space-y-2">
              {upcomingAppts.map(a => {
                const pet = pets.find(p => p.id === a.petId);
                return (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <span>{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                    <span className="font-medium">{pet?.name}</span>
                    <span className="text-muted-foreground">— {a.reason}</span>
                    <Badge variant="secondary" className="ml-auto">{formatDate(a.nextAppointmentDate)}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Select value={filterPet} onValueChange={setFilterPet}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="All pets" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pets</SelectItem>
            {activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="visits" className="rounded-lg">Vet Visits</TabsTrigger>
          <TabsTrigger value="vaccinations" className="rounded-lg">Vaccinations</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="space-y-4 mt-4">
          <Button onClick={openAddVisit} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Vet Visit</Button>
          {filteredVisits.length === 0 ? (
            <div className="text-center py-12"><p className="text-4xl mb-2">🏥</p><p className="text-muted-foreground">No vet visits recorded yet.</p></div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredVisits.map(v => {
                  const pet = pets.find(p => p.id === v.petId);
                  return (
                    <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card className="rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-4">
                          <span className="text-2xl">{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{pet?.name} — {v.reason}</p>
                            <p className="text-sm text-muted-foreground">{v.vetName} • {formatDate(v.visitDate)}</p>
                            {v.diagnosis && <p className="text-sm text-muted-foreground mt-1">{v.diagnosis}</p>}
                          </div>
                          {v.cost > 0 && <Badge variant="outline">${v.cost}</Badge>}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditVisit(v)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingVisitId(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4 mt-4">
          <Button onClick={openAddVaccine} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Vaccination</Button>
          {filteredVaccines.length === 0 ? (
            <div className="text-center py-12"><p className="text-4xl mb-2">💉</p><p className="text-muted-foreground">No vaccinations recorded yet.</p></div>
          ) : (
            <Card className="rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Pet</TableHead><TableHead>Vaccine</TableHead><TableHead>Date Given</TableHead><TableHead>Next Due</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVaccines.map(v => {
                    const pet = pets.find(p => p.id === v.petId);
                    const status = getVaccineStatus(v.nextDueDate);
                    return (
                      <TableRow key={v.id}>
                        <TableCell>{pet ? `${SPECIES_EMOJIS[pet.species]} ${pet.name}` : 'Unknown'}</TableCell>
                        <TableCell className="font-medium">{v.vaccineName}</TableCell>
                        <TableCell>{formatDate(v.dateGiven)}</TableCell>
                        <TableCell>{v.nextDueDate ? formatDate(v.nextDueDate) : '—'}</TableCell>
                        <TableCell>
                          {status === 'overdue' && <Badge className="bg-destructive text-destructive-foreground">Overdue</Badge>}
                          {status === 'due-soon' && <Badge className="bg-accent text-accent-foreground">Due Soon</Badge>}
                          {status === 'ok' && <Badge variant="secondary">Up to date</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditVaccine(v)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingVaccineId(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Visit Form */}
      <Dialog open={showVisitForm} onOpenChange={setShowVisitForm}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingVisit ? 'Edit' : 'Add'} Vet Visit</DialogTitle><DialogDescription>Record a vet visit for your pet.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Pet *</Label>
              <Select value={visitForm.petId} onValueChange={v => setVisitForm(f => ({ ...f, petId: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DateField label="Visit Date *" value={visitForm.visitDate} onChange={v => setVisitForm(f => ({ ...f, visitDate: v }))} />
            <div><Label>Vet/Clinic</Label><Input value={visitForm.vetName} onChange={e => setVisitForm(f => ({ ...f, vetName: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Reason</Label><Input value={visitForm.reason} onChange={e => setVisitForm(f => ({ ...f, reason: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Diagnosis</Label><Textarea value={visitForm.diagnosis} onChange={e => setVisitForm(f => ({ ...f, diagnosis: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Treatment</Label><Textarea value={visitForm.treatment} onChange={e => setVisitForm(f => ({ ...f, treatment: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Cost ($)</Label><Input type="number" value={visitForm.cost || ''} onChange={e => setVisitForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} className="rounded-xl" /></div>
            <DateField label="Next Appointment" value={visitForm.nextAppointmentDate} onChange={v => setVisitForm(f => ({ ...f, nextAppointmentDate: v }))} />
            <div><Label>Attachments Note</Label><Input value={visitForm.attachmentsNote} onChange={e => setVisitForm(f => ({ ...f, attachmentsNote: e.target.value }))} className="rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVisitForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveVisit} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vaccine Form */}
      <Dialog open={showVaccineForm} onOpenChange={setShowVaccineForm}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingVaccine ? 'Edit' : 'Add'} Vaccination</DialogTitle><DialogDescription>Record a vaccination.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Pet *</Label>
              <Select value={vaccineForm.petId} onValueChange={v => setVaccineForm(f => ({ ...f, petId: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Vaccine Name *</Label><Input value={vaccineForm.vaccineName} onChange={e => setVaccineForm(f => ({ ...f, vaccineName: e.target.value }))} className="rounded-xl" /></div>
            <DateField label="Date Given" value={vaccineForm.dateGiven} onChange={v => setVaccineForm(f => ({ ...f, dateGiven: v }))} />
            <div><Label>Batch Number</Label><Input value={vaccineForm.batchNumber} onChange={e => setVaccineForm(f => ({ ...f, batchNumber: e.target.value }))} className="rounded-xl" /></div>
            <div><Label>Vet Name</Label><Input value={vaccineForm.vetName} onChange={e => setVaccineForm(f => ({ ...f, vetName: e.target.value }))} className="rounded-xl" /></div>
            <DateField label="Next Due Date" value={vaccineForm.nextDueDate} onChange={v => setVaccineForm(f => ({ ...f, nextDueDate: v }))} />
            <div><Label>Notes</Label><Textarea value={vaccineForm.notes} onChange={e => setVaccineForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVaccineForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveVaccine} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={!!deletingVisitId} onOpenChange={open => !open && setDeletingVisitId(null)}>
        <AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle>Delete this vet visit?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteVisit} className="rounded-xl bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deletingVaccineId} onOpenChange={open => !open && setDeletingVaccineId(null)}>
        <AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle>Delete this vaccination?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteVaccine} className="rounded-xl bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
