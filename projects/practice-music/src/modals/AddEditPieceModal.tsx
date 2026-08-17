import { useState } from 'react';
import type { Piece } from '../utils/storage';
import { generateId } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Props {
  piece: Piece | null;
  instruments: string[];
  onClose: () => void;
  onSave: (p: Piece) => void;
}

const COLORS = ['#6C63FF', '#FF6584', '#43E8C8', '#FBBF24', '#38BDF8', '#F472B6'];
const DIFFICULTIES: Piece['difficulty'][] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DIFF_COLORS: Record<string, string> = {
  Beginner: 'bg-success/20 text-success border-success/30',
  Intermediate: 'bg-warning/20 text-warning border-warning/30',
  Advanced: 'bg-secondary/20 text-secondary border-secondary/30',
  Expert: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function AddEditPieceModal({ piece, instruments, onClose, onSave }: Props) {
  const [title, setTitle] = useState(piece?.title || '');
  const [composer, setComposer] = useState(piece?.composer || '');
  const [instrument, setInstrument] = useState(piece?.instrument || '');
  const [difficulty, setDifficulty] = useState<Piece['difficulty']>(piece?.difficulty || 'Intermediate');
  const [targetBPM, setTargetBPM] = useState(piece?.targetBPM || 120);
  const [tagsStr, setTagsStr] = useState(piece?.tags.join(', ') || '');
  const [color, setColor] = useState(piece?.color || COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Required';
    if (!instrument.trim()) e.instrument = 'Required';
    if (targetBPM < 20 || targetBPM > 300) e.targetBPM = '20–300';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      id: piece?.id || generateId(),
      title: title.trim(),
      composer: composer.trim(),
      instrument: instrument.trim(),
      difficulty,
      targetBPM,
      currentBPM: piece?.currentBPM || 0,
      status: piece?.status || 'active',
      dateAdded: piece?.dateAdded || new Date().toISOString().split('T')[0],
      dateMastered: piece?.dateMastered || null,
      color,
      tags,
    });
    toast.success(piece ? 'Piece updated' : 'Piece added');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="font-heading font-bold text-foreground text-lg mb-4">{piece ? 'Edit Piece' : 'Add Piece'}</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Title <span className="text-destructive">*</span></label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-muted border-border mt-1" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Composer</label>
            <Input value={composer} onChange={e => setComposer(e.target.value)} className="bg-muted border-border mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Instrument <span className="text-destructive">*</span></label>
            <Input value={instrument} onChange={e => setInstrument(e.target.value)} list="instruments" className="bg-muted border-border mt-1" />
            <datalist id="instruments">{instruments.map(i => <option key={i} value={i} />)}</datalist>
            {errors.instrument && <p className="text-xs text-destructive mt-1">{errors.instrument}</p>}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Difficulty <span className="text-destructive">*</span></label>
            <div className="flex gap-2 mt-1">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${difficulty === d ? DIFF_COLORS[d] + ' border-current' : 'bg-muted text-muted-foreground border-transparent'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Target BPM <span className="text-destructive">*</span></label>
            <Input type="number" value={targetBPM} onChange={e => setTargetBPM(Number(e.target.value))} className="bg-muted border-border mt-1 w-32" min={20} max={300} />
            {errors.targetBPM && <p className="text-xs text-destructive mt-1">{errors.targetBPM}</p>}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Tags (comma-separated)</label>
            <Input value={tagsStr} onChange={e => setTagsStr(e.target.value)} className="bg-muted border-border mt-1" placeholder="e.g. classical, romantic" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Color</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110' : ''}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="border-border">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">{piece ? 'Update' : 'Add Piece'}</Button>
        </div>
      </div>
    </div>
  );
}
