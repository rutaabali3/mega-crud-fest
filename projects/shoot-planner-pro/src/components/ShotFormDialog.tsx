import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Shot, ShotPriority } from '@/types';

interface ShotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (shot: Shot) => void;
  initial?: Shot;
  nextOrder: number;
}

export function ShotFormDialog({ open, onOpenChange, onSave, initial, nextOrder }: ShotFormDialogProps) {
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<ShotPriority>(initial?.priority ?? 'must-have');
  const [lens, setLens] = useState(initial?.planned.lens ?? '');
  const [aperture, setAperture] = useState(initial?.planned.aperture ?? '');
  const [shutterSpeed, setShutterSpeed] = useState(initial?.planned.shutterSpeed ?? '');
  const [iso, setIso] = useState(initial?.planned.iso ?? '');

  const isEdit = !!initial;

  const handleSave = () => {
    if (!description.trim()) return;
    const shot: Shot = {
      id: initial?.id ?? crypto.randomUUID(),
      description: description.trim(),
      priority,
      planned: { lens, aperture, shutterSpeed, iso },
      actual: initial?.actual,
      captured: initial?.captured ?? false,
      order: initial?.order ?? nextOrder,
    };
    onSave(shot);
    onOpenChange(false);
    if (!isEdit) {
      setDescription('');
      setPriority('must-have');
      setLens('');
      setAperture('');
      setShutterSpeed('');
      setIso('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Shot' : 'Add Shot'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Wide establishing shot of venue" />
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={v => setPriority(v as ShotPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="must-have">Must Have</SelectItem>
                <SelectItem value="nice-to-have">Nice to Have</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Lens</Label>
            <Input value={lens} onChange={e => setLens(e.target.value)} placeholder="e.g. 85mm f/1.4" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">Aperture</Label>
              <Input value={aperture} onChange={e => setAperture(e.target.value)} placeholder="f/2.8" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Shutter</Label>
              <Input value={shutterSpeed} onChange={e => setShutterSpeed(e.target.value)} placeholder="1/250" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">ISO</Label>
              <Input value={iso} onChange={e => setIso(e.target.value)} placeholder="400" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!description.trim()}>{isEdit ? 'Save' : 'Add Shot'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
