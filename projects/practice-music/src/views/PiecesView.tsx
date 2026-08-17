import { useState, useMemo } from 'react';
import { Search, Plus, Music, MoreVertical, Trash2, Edit, Trophy, PlayCircle } from 'lucide-react';
import type { Piece, Session } from '../utils/storage';
import { generateId } from '../utils/storage';
import { formatDate } from '../utils/dateUtils';
import { EmptyState } from '../components/EmptyState';
import { AddEditPieceModal } from '../modals/AddEditPieceModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  pieces: Piece[];
  sessions: Session[];
  onUpdatePieces: (p: Piece[]) => void;
  onUpdateSessions: (s: Session[]) => void;
  onLogSession: () => void;
}

type SortKey = 'dateAdded' | 'title' | 'difficulty' | 'lastPracticed';

const DIFF_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2, Expert: 3 };

export function PiecesView({ pieces, sessions, onUpdatePieces, onUpdateSessions, onLogSession }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('dateAdded');
  const [editPiece, setEditPiece] = useState<Piece | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletePiece, setDeletePiece] = useState<Piece | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const instruments = useMemo(() => [...new Set(pieces.map(p => p.instrument))], [pieces]);

  const filtered = useMemo(() => {
    let list = pieces;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.composer.toLowerCase().includes(q) || p.instrument.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (instrumentFilter !== 'all') list = list.filter(p => p.instrument === instrumentFilter);

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'difficulty': return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
        case 'lastPracticed': {
          const aLast = sessions.filter(s => s.pieceId === a.id).sort((x, y) => y.date.localeCompare(x.date))[0]?.date || '';
          const bLast = sessions.filter(s => s.pieceId === b.id).sort((x, y) => y.date.localeCompare(x.date))[0]?.date || '';
          return bLast.localeCompare(aLast);
        }
        default: return b.dateAdded.localeCompare(a.dateAdded);
      }
    });
    return list;
  }, [pieces, sessions, search, statusFilter, instrumentFilter, sortBy]);

  const handleSave = (piece: Piece) => {
    const exists = pieces.find(p => p.id === piece.id);
    if (exists) {
      onUpdatePieces(pieces.map(p => p.id === piece.id ? piece : p));
    } else {
      onUpdatePieces([...pieces, piece]);
    }
    setShowAdd(false);
    setEditPiece(null);
  };

  const handleDelete = () => {
    if (!deletePiece) return;
    onUpdatePieces(pieces.filter(p => p.id !== deletePiece.id));
    onUpdateSessions(sessions.filter(s => s.pieceId !== deletePiece.id));
    setDeletePiece(null);
  };

  const handleMaster = (id: string) => {
    onUpdatePieces(pieces.map(p => p.id === id ? { ...p, status: 'mastered' as const, dateMastered: new Date().toISOString() } : p));
    setOpenMenu(null);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pieces..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="mastered">Mastered</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <select value={instrumentFilter} onChange={e => setInstrumentFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="all">All Instruments</option>
            {instruments.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="dateAdded">Date Added</option>
            <option value="title">Title</option>
            <option value="difficulty">Difficulty</option>
            <option value="lastPracticed">Last Practiced</option>
          </select>
          <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 gap-1.5">
            <Plus size={16} /> Add Piece
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Music size={48} />} title="No pieces found" description={pieces.length === 0 ? "Add your first piece to start tracking." : "Try adjusting your filters."} actionLabel="Add Piece" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const pct = p.targetBPM > 0 ? Math.min(100, Math.round((p.currentBPM / p.targetBPM) * 100)) : 0;
            const totalMin = sessions.filter(s => s.pieceId === p.id).reduce((a, s) => a + s.durationMinutes, 0);
            return (
              <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all relative">
                <div className="flex">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">{p.title}</h3>
                        <p className="text-xs text-muted-foreground">{p.composer}</p>
                      </div>
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)} className="text-muted-foreground hover:text-foreground p-1">
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === p.id && (
                          <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[140px] py-1">
                            <button onClick={() => { setEditPiece(p); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"><Edit size={14} /> Edit</button>
                            <button onClick={onLogSession} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"><PlayCircle size={14} /> Log Session</button>
                            {p.status === 'active' && <button onClick={() => handleMaster(p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent hover:bg-muted"><Trophy size={14} /> Mark Mastered</button>}
                            <button onClick={() => { setDeletePiece(p); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"><Trash2 size={14} /> Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground">{p.instrument}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                        p.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                        p.difficulty === 'Advanced' ? 'bg-secondary/20 text-secondary' :
                        'bg-destructive/20 text-destructive'
                      }`}>{p.difficulty}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'active' ? 'bg-primary/20 text-primary' :
                        p.status === 'mastered' ? 'bg-accent/20 text-accent' :
                        'bg-muted text-muted-foreground'
                      }`}>{p.status}</span>
                      {p.tags.map(t => <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{t}</span>)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>BPM: {p.currentBPM} / {p.targetBPM}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Total: {totalMin} min</span>
                      <span>Added {formatDate(p.dateAdded)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAdd || editPiece) && (
        <AddEditPieceModal piece={editPiece} instruments={instruments} onClose={() => { setShowAdd(false); setEditPiece(null); }} onSave={handleSave} />
      )}
      {deletePiece && (
        <ConfirmDeleteModal title={deletePiece.title} onConfirm={handleDelete} onCancel={() => setDeletePiece(null)} />
      )}
    </div>
  );
}
