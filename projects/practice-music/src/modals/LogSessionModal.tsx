import { useState } from 'react';
import { format } from 'date-fns';
import type { Piece, Session } from '../utils/storage';
import { generateId } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  pieces: Piece[];
  onClose: () => void;
  onSave: (s: Session) => void;
  defaultInstrument: string;
}

const MOODS: { value: Session['mood']; emoji: string }[] = [
  { value: '1', emoji: '😫' },
  { value: '2', emoji: '😕' },
  { value: '3', emoji: '😐' },
  { value: '4', emoji: '😊' },
  { value: '5', emoji: '🤩' },
];

export function LogSessionModal({ pieces, onClose, onSave, defaultInstrument }: Props) {
  const activePieces = pieces.filter(p => p.status === 'active');
  const [pieceId, setPieceId] = useState(activePieces[0]?.id || '');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(30);
  const [bpm, setBpm] = useState(0);
  const [mood, setMood] = useState<Session['mood']>('3');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const selectedPiece = pieces.find(p => p.id === pieceId);
  const filteredPieces = activePieces.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.composer.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!pieceId) e.pieceId = 'Select a piece';
    if (!date) e.date = 'Required';
    if (duration < 1) e.duration = 'Min 1 minute';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const session: Session = {
      id: generateId(),
      pieceId,
      date,
      durationMinutes: duration,
      bpmReached: bpm || 0,
      mood,
      notes,
      instrument: selectedPiece?.instrument || defaultInstrument,
    };
    onSave(session);
    toast.success('Session logged!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <h2 className="font-heading font-bold text-foreground text-lg mb-4">Log Practice Session</h2>
        <div className="space-y-4">
          {/* Piece select */}
          <div>
            <label className="text-sm text-muted-foreground">Piece <span className="text-destructive">*</span></label>
            <Input placeholder="Search pieces..." value={search} onChange={e => setSearch(e.target.value)} className="bg-muted border-border mt-1 mb-1" />
            <div className="max-h-32 overflow-y-auto space-y-1 bg-muted rounded-lg p-1">
              {filteredPieces.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPieceId(p.id); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${pieceId === p.id ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-muted'}`}
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="text-muted-foreground ml-1 text-xs">— {p.composer}</span>
                </button>
              ))}
              {filteredPieces.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No active pieces</p>}
            </div>
            {errors.pieceId && <p className="text-xs text-destructive mt-1">{errors.pieceId}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-muted-foreground">Date <span className="text-destructive">*</span></label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-muted border-border mt-1" />
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm text-muted-foreground">Duration (minutes) <span className="text-destructive">*</span></label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="bg-muted border-border w-24" min={1} />
              {[5, 15, 30, 60].map(n => (
                <button key={n} onClick={() => setDuration(d => d + n)} className="text-xs bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary px-2 py-1 rounded-lg transition-colors">+{n}</button>
              ))}
            </div>
            {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration}</p>}
          </div>

          {/* BPM */}
          <div>
            <label className="text-sm text-muted-foreground">BPM Reached</label>
            <Input type="number" value={bpm || ''} onChange={e => setBpm(Number(e.target.value))} placeholder={selectedPiece ? `Current: ${selectedPiece.currentBPM}` : ''} className="bg-muted border-border mt-1 w-32" min={0} max={300} />
          </div>

          {/* Mood */}
          <div>
            <label className="text-sm text-muted-foreground">Mood</label>
            <div className="flex gap-2 mt-1">
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setMood(m.value)} className={`text-2xl p-1 rounded-lg transition-all ${mood === m.value ? 'bg-primary/20 scale-110' : 'hover:bg-muted'}`}>{m.emoji}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-muted-foreground">Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-muted border-border mt-1" placeholder="What went well? What needs work?" rows={3} />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="border-border">Cancel</Button>
          <Button onClick={handleSubmit} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Log Session</Button>
        </div>
      </div>
    </div>
  );
}
