import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Shoot, ShootType } from '@/types';
import { gearTemplates } from '@/data/gear-templates';

const shootTypes: { value: ShootType; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'event', label: 'Event' },
  { value: 'product', label: 'Product' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'street', label: 'Street' },
  { value: 'other', label: 'Other' },
];

interface ShootFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (shoot: Shoot) => void;
  initial?: Shoot;
}

export function ShootFormDialog({ open, onOpenChange, onSave, initial }: ShootFormDialogProps) {
  const [client, setClient] = useState(initial?.client ?? '');
  const [date, setDate] = useState<Date | undefined>(initial ? new Date(initial.date) : undefined);
  const [location, setLocation] = useState(initial?.location ?? '');
  const [type, setType] = useState<ShootType>(initial?.type ?? 'portrait');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const isEdit = !!initial;

  const handleSave = () => {
    if (!client.trim() || !date) return;

    const gear = initial?.gear ?? gearTemplates[type].map((name, i) => ({
      id: crypto.randomUUID(),
      name,
      packed: false,
    }));

    const shoot: Shoot = {
      id: initial?.id ?? crypto.randomUUID(),
      client: client.trim(),
      date: date.toISOString(),
      location: location.trim(),
      type,
      notes: notes.trim(),
      shots: initial?.shots ?? [],
      gear,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };

    onSave(shoot);
    onOpenChange(false);
    if (!isEdit) {
      setClient('');
      setDate(undefined);
      setLocation('');
      setType('portrait');
      setNotes('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Shoot' : 'New Shoot'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="client">Client / Project</Label>
            <Input id="client" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Sarah's Wedding" />
          </div>
          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Central Park, NYC" />
          </div>
          <div className="grid gap-2">
            <Label>Shoot Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ShootType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {shootTypes.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!client.trim() || !date}>{isEdit ? 'Save Changes' : 'Create Shoot'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
