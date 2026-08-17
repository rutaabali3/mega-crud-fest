import { useState } from 'react';
import { Plus, Edit2, Trash2, Archive, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePetCare } from '@/contexts/PetCareContext';
import { calculateAge, calculateHumanAge, getLastVetVisit, getNextFeeding, formatDate } from '@/lib/pet-utils';
import { SPECIES_EMOJIS, type Pet, type Species, type Sex } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SPECIES_OPTIONS: Species[] = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Reptile', 'Other'];
const SEX_OPTIONS: Sex[] = ['Male', 'Female', 'Unknown'];

const emptyPet: Omit<Pet, 'id' | 'createdAt'> = {
  name: '', species: 'Dog', breed: '', dateOfBirth: '', sex: 'Unknown',
  photoUrl: '', emoji: '', notes: '', archived: false,
};

export default function PetsPage() {
  const { pets, setPets, vetVisits, feedingSchedules, feedingLogs, vaccinations, weights, medications } = usePetCare();
  const { searchQuery } = usePetCare();
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [form, setForm] = useState(emptyPet);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const activePets = pets.filter(p => !p.archived).filter(p =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAdd = () => { setForm(emptyPet); setEditingPet(null); setErrors({}); setShowForm(true); };
  const openEdit = (pet: Pet) => {
    setForm({ name: pet.name, species: pet.species, breed: pet.breed, dateOfBirth: pet.dateOfBirth, sex: pet.sex, photoUrl: pet.photoUrl, emoji: pet.emoji, notes: pet.notes, archived: pet.archived });
    setEditingPet(pet); setErrors({}); setShowForm(true);
  };

  const save = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.name.trim()) newErrors.name = true;
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    if (editingPet) {
      setPets(prev => prev.map(p => p.id === editingPet.id ? { ...p, ...form } : p));
    } else {
      const newPet: Pet = { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setPets(prev => [...prev, newPet]);
    }
    setShowForm(false);
  };

  const archivePet = () => {
    if (!deletingPet) return;
    setPets(prev => prev.map(p => p.id === deletingPet.id ? { ...p, archived: true } : p));
    setDeletingPet(null);
  };

  const deletePet = () => {
    if (!deletingPet) return;
    setPets(prev => prev.filter(p => p.id !== deletingPet.id));
    setDeletingPet(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Pets 🐾</h1>
        <Button onClick={openAdd} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Add Pet
        </Button>
      </div>

      {activePets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🐾</p>
          <h2 className="text-xl font-semibold mb-2">No pets yet!</h2>
          <p className="text-muted-foreground mb-4">Add your first furry (or scaly) friend to get started.</p>
          <Button onClick={openAdd} className="rounded-xl">Add Your First Pet</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {activePets.map((pet, i) => {
              const lastVisit = getLastVetVisit(pet.id, vetVisits);
              const nextFeed = getNextFeeding(pet.id, feedingSchedules, feedingLogs);
              return (
                <motion.div key={pet.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}>
                  <Card className="rounded-2xl hover:shadow-md transition-shadow group cursor-pointer relative">
                    <Link to={`/pets/${pet.id}`} className="absolute inset-0 z-10" />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                          {pet.photoUrl ? (
                            <img src={pet.photoUrl} alt={pet.name} className="h-14 w-14 rounded-2xl object-cover" />
                          ) : (
                            pet.emoji || SPECIES_EMOJIS[pet.species]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">{pet.name}</h3>
                            <Badge variant="secondary" className="text-xs shrink-0">{pet.species}</Badge>
                          </div>
                          {pet.breed && <p className="text-sm text-muted-foreground">{pet.breed}</p>}
                          {pet.dateOfBirth && (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-muted-foreground">{calculateAge(pet.dateOfBirth)} old</p>
                              <p className="text-xs text-primary font-medium">~{calculateHumanAge(pet.dateOfBirth, pet.species)} human years</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                        <span>🏥 {lastVisit ? formatDate(lastVisit) : 'No visits'}</span>
                        <span>🍽️ {nextFeed ? `Next: ${nextFeed}` : 'No schedule'}</span>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={e => { e.preventDefault(); openEdit(pet); }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={e => { e.preventDefault(); setDeletingPet(pet); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
            <DialogDescription>Fill in your pet's information below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={cn('rounded-xl', errors.name && 'border-destructive')} placeholder="e.g. Bella" />
              {errors.name && <p className="text-xs text-destructive mt-1">Name is required</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Species</Label>
                <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v as Species }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{SPECIES_OPTIONS.map(s => <SelectItem key={s} value={s}>{SPECIES_EMOJIS[s]} {s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sex</Label>
                <Select value={form.sex} onValueChange={v => setForm(f => ({ ...f, sex: v as Sex }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{SEX_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Breed</Label>
              <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} className="rounded-xl" placeholder="e.g. Golden Retriever" />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left rounded-xl', !form.dateOfBirth && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dateOfBirth ? format(parseISO(form.dateOfBirth), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.dateOfBirth ? parseISO(form.dateOfBirth) : undefined} onSelect={d => setForm(f => ({ ...f, dateOfBirth: d ? d.toISOString().split('T')[0] : '' }))} disabled={d => d > new Date()} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Photo</Label>
              <Input
                type="file"
                accept="image/*"
                className="rounded-xl"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => setForm(f => ({ ...f, photoUrl: reader.result as string }));
                  reader.readAsDataURL(file);
                }}
              />
              {form.photoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={form.photoUrl} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setForm(f => ({ ...f, photoUrl: '' }))}>Remove</Button>
                </div>
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl" placeholder="Any special notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={save} className="rounded-xl">{editingPet ? 'Save Changes' : 'Add Pet'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingPet} onOpenChange={open => !open && setDeletingPet(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deletingPet?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Choose to archive (hide from view) or permanently delete all data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <Button variant="secondary" onClick={archivePet} className="rounded-xl"><Archive className="h-4 w-4 mr-2" /> Archive</Button>
            <AlertDialogAction onClick={deletePet} className="rounded-xl bg-destructive text-destructive-foreground">Delete Forever</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
