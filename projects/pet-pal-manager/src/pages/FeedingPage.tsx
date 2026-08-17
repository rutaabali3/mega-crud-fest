import { useState } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { usePetCare } from '@/contexts/PetCareContext';
import { SPECIES_EMOJIS, type FeedingSchedule, type FeedingLog } from '@/lib/types';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const emptySchedule = { petId: '', foodType: '', amount: 0, unit: 'g' as 'g' | 'ml' | 'cups', timesPerDay: 1, specificTimes: ['08:00'], notes: '', active: true };

export default function FeedingPage() {
  const { pets, feedingSchedules, setFeedingSchedules, feedingLogs, setFeedingLogs } = usePetCare();
  const activePets = pets.filter(p => !p.archived);
  const [tab, setTab] = useState('schedules');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeedingSchedule | null>(null);
  const [form, setForm] = useState(emptySchedule);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ petId: '', foodType: '', amount: 0, unit: 'g' as 'g' | 'ml' | 'cups', notes: '' });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = feedingLogs.filter(l => l.dateTime.startsWith(todayStr));

  const openAdd = () => { setForm(emptySchedule); setEditing(null); setShowForm(true); };
  const openEdit = (s: FeedingSchedule) => { setForm({ petId: s.petId, foodType: s.foodType, amount: s.amount, unit: s.unit, timesPerDay: s.timesPerDay, specificTimes: s.specificTimes, notes: s.notes, active: s.active }); setEditing(s); setShowForm(true); };

  const save = () => {
    if (!form.petId || !form.foodType) return;
    if (editing) {
      setFeedingSchedules(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      setFeedingSchedules(prev => [...prev, { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as FeedingSchedule]);
    }
    setShowForm(false);
  };

  const deleteSchedule = () => { if (deletingId) { setFeedingSchedules(prev => prev.filter(s => s.id !== deletingId)); setDeletingId(null); } };

  const checkMeal = (scheduleId: string, time: string) => {
    const log: FeedingLog = {
      id: crypto.randomUUID(),
      petId: feedingSchedules.find(s => s.id === scheduleId)?.petId || '',
      scheduleId,
      dateTime: `${todayStr}T${time}:00`,
      foodType: feedingSchedules.find(s => s.id === scheduleId)?.foodType || '',
      amount: feedingSchedules.find(s => s.id === scheduleId)?.amount || 0,
      unit: feedingSchedules.find(s => s.id === scheduleId)?.unit || 'g',
      notes: '',
      createdAt: new Date().toISOString(),
    };
    setFeedingLogs(prev => [...prev, log]);
  };

  const isMealDone = (scheduleId: string, time: string) => todayLogs.some(l => l.scheduleId === scheduleId && l.dateTime.includes(time));

  const addManualLog = () => {
    if (!logForm.petId) return;
    const log: FeedingLog = { ...logForm, id: crypto.randomUUID(), dateTime: new Date().toISOString(), createdAt: new Date().toISOString() };
    setFeedingLogs(prev => [...prev, log]);
    setShowLogForm(false);
  };

  const updateTimes = (count: number) => {
    const times: string[] = [];
    for (let i = 0; i < count; i++) {
      const h = Math.round(8 + (i * (12 / Math.max(count - 1, 1))));
      times.push(`${String(h).padStart(2, '0')}:00`);
    }
    setForm(f => ({ ...f, timesPerDay: count, specificTimes: times }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Feeding 🍽️</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="schedules" className="rounded-lg">Schedules</TabsTrigger>
          <TabsTrigger value="log" className="rounded-lg">Log</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4 mt-4">
          <Button onClick={openAdd} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Schedule</Button>

          {feedingSchedules.filter(s => s.active).length === 0 ? (
            <div className="text-center py-12"><p className="text-4xl mb-2">🍽️</p><p className="text-muted-foreground">No feeding schedules set up yet.</p></div>
          ) : (
            <div className="space-y-4">
              {activePets.map(pet => {
                const petSchedules = feedingSchedules.filter(s => s.petId === pet.id && s.active);
                if (!petSchedules.length) return null;
                const totalMeals = petSchedules.reduce((sum, s) => sum + s.timesPerDay, 0);
                const doneMeals = petSchedules.reduce((sum, s) => sum + s.specificTimes.filter(t => isMealDone(s.id, t)).length, 0);
                return (
                  <motion.div key={pet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-xl">{SPECIES_EMOJIS[pet.species]}</span> {pet.name}
                          <span className="text-sm text-muted-foreground font-normal ml-auto">{doneMeals}/{totalMeals} meals</span>
                        </CardTitle>
                        <Progress value={(doneMeals / totalMeals) * 100} className="h-2 mt-2" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {petSchedules.map(sched => (
                          <div key={sched.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{sched.foodType} — {sched.amount}{sched.unit}</p>
                                {sched.notes && <p className="text-xs text-muted-foreground">{sched.notes}</p>}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sched)}><Edit2 className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(sched.id)}><Trash2 className="h-3 w-3" /></Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sched.specificTimes.map(time => {
                                const done = isMealDone(sched.id, time);
                                return (
                                  <Button key={time} variant={done ? 'default' : 'outline'} size="sm" className="rounded-xl gap-1.5 text-xs" onClick={() => !done && checkMeal(sched.id, time)} disabled={done}>
                                    {done ? <Check className="h-3 w-3" /> : null} {time}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="log" className="space-y-4 mt-4">
          <Button onClick={() => { setLogForm({ petId: '', foodType: '', amount: 0, unit: 'g', notes: '' }); setShowLogForm(true); }} className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Manual Log Entry</Button>
          {feedingLogs.length === 0 ? (
            <div className="text-center py-12"><p className="text-4xl mb-2">📋</p><p className="text-muted-foreground">No feeding logs yet.</p></div>
          ) : (
            <div className="space-y-2">
              {[...feedingLogs].sort((a, b) => b.dateTime.localeCompare(a.dateTime)).slice(0, 50).map(log => {
                const pet = pets.find(p => p.id === log.petId);
                return (
                  <Card key={log.id} className="rounded-xl">
                    <CardContent className="p-3 flex items-center gap-3">
                      <span className="text-lg">{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pet?.name} — {log.foodType}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(log.dateTime), 'MMM d, h:mm a')} • {log.amount}{log.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Feeding Schedule</DialogTitle><DialogDescription>Set up a feeding schedule.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Pet *</Label>
              <Select value={form.petId} onValueChange={v => setForm(f => ({ ...f, petId: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Food Type/Brand *</Label><Input value={form.foodType} onChange={e => setForm(f => ({ ...f, foodType: e.target.value }))} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount</Label><Input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="rounded-xl" /></div>
              <div><Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v as 'g' | 'ml' | 'cups' }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="g">g</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="cups">cups</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Times per day: {form.timesPerDay}</Label>
              <Input type="range" min={1} max={6} value={form.timesPerDay} onChange={e => updateTimes(parseInt(e.target.value))} className="mt-1" />
            </div>
            <div className="space-y-2">
              <Label>Specific Times</Label>
              {form.specificTimes.map((t, i) => (
                <Input key={i} type="time" value={t} onChange={e => {
                  const times = [...form.specificTimes];
                  times[i] = e.target.value;
                  setForm(f => ({ ...f, specificTimes: times }));
                }} className="rounded-xl" />
              ))}
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl" placeholder="e.g., mix with water" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={save} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Log Form */}
      <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Manual Feeding Log</DialogTitle><DialogDescription>Log a feeding manually.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Pet *</Label>
              <Select value={logForm.petId} onValueChange={v => setLogForm(f => ({ ...f, petId: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>{activePets.map(p => <SelectItem key={p.id} value={p.id}>{SPECIES_EMOJIS[p.species]} {p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Food</Label><Input value={logForm.foodType} onChange={e => setLogForm(f => ({ ...f, foodType: e.target.value }))} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount</Label><Input type="number" value={logForm.amount || ''} onChange={e => setLogForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="rounded-xl" /></div>
              <div><Label>Unit</Label>
                <Select value={logForm.unit} onValueChange={v => setLogForm(f => ({ ...f, unit: v as 'g' | 'ml' | 'cups' }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="g">g</SelectItem><SelectItem value="ml">ml</SelectItem><SelectItem value="cups">cups</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={addManualLog} className="rounded-xl">Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl"><AlertDialogHeader><AlertDialogTitle>Delete schedule?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={deleteSchedule} className="rounded-xl bg-destructive">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
