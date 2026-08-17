import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shot, ActualSettings } from '@/types';

interface ActualSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shot: Shot;
  onSave: (actual: ActualSettings) => void;
}

export function ActualSettingsDialog({ open, onOpenChange, shot, onSave }: ActualSettingsDialogProps) {
  const [lens, setLens] = useState(shot.actual?.lens ?? shot.planned.lens);
  const [aperture, setAperture] = useState(shot.actual?.aperture ?? shot.planned.aperture);
  const [shutterSpeed, setShutterSpeed] = useState(shot.actual?.shutterSpeed ?? shot.planned.shutterSpeed);
  const [iso, setIso] = useState(shot.actual?.iso ?? shot.planned.iso);
  const [notes, setNotes] = useState(shot.actual?.notes ?? '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actual Settings Used</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Log what you actually used for: "{shot.description}"</p>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Lens</Label>
            <Input value={lens} onChange={e => setLens(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">Aperture</Label>
              <Input value={aperture} onChange={e => setAperture(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Shutter</Label>
              <Input value={shutterSpeed} onChange={e => setShutterSpeed(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">ISO</Label>
              <Input value={iso} onChange={e => setIso(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any observations..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave({ lens, aperture, shutterSpeed, iso, notes }); onOpenChange(false); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
