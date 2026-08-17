import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, BookOpen, Trophy, Pencil, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import type { Deck, Card, Difficulty, DeckColor } from '@/types/flashcard';
import { DECK_COLORS } from '@/types/flashcard';
import { relativeDate, formatFullDate, dueStatus } from '@/lib/dateUtils';

function getDeckColorValue(color: DeckColor): string {
  return DECK_COLORS.find(c => c.name === color)?.value || '#6366F1';
}

const difficultyColors = { easy: 'bg-emerald-500/10 text-emerald-400', medium: 'bg-amber-500/10 text-amber-400', hard: 'bg-red-500/10 text-red-400' };

type SortBy = 'difficulty' | 'dueDate' | 'created' | 'az';
type FilterBy = 'all' | 'easy' | 'medium' | 'hard' | 'due';

interface Props {
  deck: Deck;
  cards: Card[];
  onBack: () => void;
  onStudy: (mode: 'all' | 'due') => void;
  onQuiz: () => void;
  onCreateCard: (front: string, back: string, difficulty: Difficulty) => void;
  onUpdateCard: (id: string, front: string, back: string, difficulty: Difficulty) => void;
  onDeleteCard: (id: string) => void;
  onDeleteDeck: () => void;
}

export default function DeckDetail({ deck, cards, onBack, onStudy, onQuiz, onCreateCard, onUpdateCard, onDeleteCard, onDeleteDeck }: Props) {
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [errors, setErrors] = useState<{ front?: boolean; back?: boolean }>({});
  const [sortBy, setSortBy] = useState<SortBy>('created');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showDeleteDeck, setShowDeleteDeck] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const colorVal = getDeckColorValue(deck.color);
  const now = new Date().toISOString();
  const dueCount = cards.filter(c => c.nextReview <= now).length;
  const mastery = cards.length > 0 ? cards.reduce((s, c) => s + (c.difficulty === 'easy' ? 100 : c.difficulty === 'medium' ? 50 : 0), 0) / cards.length : 0;

  const sorted = useMemo(() => {
    let f = [...cards];
    if (filterBy === 'easy' || filterBy === 'medium' || filterBy === 'hard') f = f.filter(c => c.difficulty === filterBy);
    if (filterBy === 'due') f = f.filter(c => c.nextReview <= now);
    f.sort((a, b) => {
      if (sortBy === 'difficulty') return ['hard','medium','easy'].indexOf(a.difficulty) - ['hard','medium','easy'].indexOf(b.difficulty);
      if (sortBy === 'dueDate') return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
      if (sortBy === 'az') return a.front.localeCompare(b.front);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return f;
  }, [cards, sortBy, filterBy, now]);

  function openAdd() { setEditingCard(null); setFront(''); setBack(''); setDifficulty('medium'); setErrors({}); setShowCardModal(true); }
  function openEdit(card: Card) { setEditingCard(card); setFront(card.front); setBack(card.back); setDifficulty(card.difficulty); setErrors({}); setShowCardModal(true); }

  function handleSave() {
    const e: typeof errors = {};
    if (!front.trim()) e.front = true;
    if (!back.trim()) e.back = true;
    if (Object.keys(e).length) { setErrors(e); return; }
    if (editingCard) onUpdateCard(editingCard.id, front.trim(), back.trim(), difficulty);
    else onCreateCard(front.trim(), back.trim(), difficulty);
    setShowCardModal(false);
  }

  // Auto-confirm delete after 5s
  function startDeleteCard(id: string) {
    setPendingDelete(id);
    setTimeout(() => { setPendingDelete(prev => { if (prev === id) { onDeleteCard(id); } return null; }); }, 5000);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Decks
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: colorVal }} />
          <h1 className="font-display text-2xl font-bold text-foreground">{deck.subject}</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { label: 'Total Cards', value: cards.length },
          { label: 'Mastery', value: `${Math.round(mastery)}%` },
          { label: 'Due Today', value: dueCount },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card px-4 py-2">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => onStudy('due')} disabled={dueCount === 0}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors">
          <BookOpen className="w-4 h-4" /> Study Due ({dueCount})
        </button>
        <button onClick={() => onStudy('all')} disabled={cards.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
          <BookOpen className="w-4 h-4" /> Study All
        </button>
        <button onClick={onQuiz} disabled={cards.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
          <Trophy className="w-4 h-4" /> Start Quiz
        </button>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          <Plus className="w-4 h-4" /> Add Card
        </button>
        <button onClick={() => setShowDeleteDeck(true)}
          className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto">
          <Trash2 className="w-4 h-4" /> Delete Deck
        </button>
      </div>

      {/* Sort / Filter */}
      {cards.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
              className="appearance-none rounded-md border border-border bg-card pl-3 pr-8 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="created">By Created</option>
              <option value="difficulty">By Difficulty</option>
              <option value="dueDate">By Due Date</option>
              <option value="az">A–Z</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
          <div className="flex gap-1">
            {(['all','easy','medium','hard','due'] as FilterBy[]).map(f => (
              <button key={f} onClick={() => setFilterBy(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${filterBy === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {f === 'due' ? 'Due Today' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card list */}
      {sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map(card => {
            const due = dueStatus(card.nextReview);
            if (pendingDelete === card.id) {
              return (
                <div key={card.id} className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 animate-fade-in">
                  <span className="text-sm text-foreground">Delete this card?</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPendingDelete(null)} className="rounded-md px-3 py-1 text-xs font-medium bg-secondary text-foreground hover:bg-accent transition-colors">Undo</button>
                    <button onClick={() => { onDeleteCard(card.id); setPendingDelete(null); }} className="rounded-md px-3 py-1 text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">Delete</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={card.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-secondary/50 transition-colors">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm text-foreground truncate max-w-[200px]">{card.front}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">{card.back}</span>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${difficultyColors[card.difficulty]}`}>{card.difficulty}</span>
                <span className={`shrink-0 text-xs ${due.color}`} title={formatFullDate(card.nextReview)}>{due.text}</span>
                <button onClick={() => openEdit(card)} className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => startDeleteCard(card.id)} className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}
        </div>
      ) : cards.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No cards yet. Add cards to start studying!</p>
          <button onClick={openAdd} className="mt-4 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 inline mr-1" /> Add Your First Card
          </button>
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">No cards match this filter</p>
      )}

      {/* Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCardModal(false)}>
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Escape') setShowCardModal(false); if (e.ctrlKey && e.key === 'Enter') handleSave(); }}>
            <h2 className="font-display text-lg font-semibold text-foreground">{editingCard ? 'Edit Card' : 'Add New Card'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Front</label>
                <textarea value={front} onChange={e => { setFront(e.target.value); setErrors(p => ({ ...p, front: false })); }} maxLength={500} rows={3} autoFocus
                  placeholder="Question or term..."
                  className={`mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${errors.front ? 'border-destructive' : 'border-border'}`} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Back</label>
                <textarea value={back} onChange={e => { setBack(e.target.value); setErrors(p => ({ ...p, back: false })); }} maxLength={500} rows={3}
                  placeholder="Answer or definition..."
                  className={`mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${errors.back ? 'border-destructive' : 'border-border'}`} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Difficulty</label>
                <div className="mt-2 flex gap-2">
                  {(['easy','medium','hard'] as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${difficulty === d ? (d === 'easy' ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : d === 'medium' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30') : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ctrl+Enter to save</span>
              <div className="flex gap-3">
                <button onClick={() => setShowCardModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  {editingCard ? 'Save Changes' : 'Save Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Deck Modal */}
      {showDeleteDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteDeck(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold text-destructive">Delete Deck</h2>
            <p className="mt-2 text-sm text-muted-foreground">This will permanently delete <strong className="text-foreground">{deck.subject}</strong> and all {cards.length} card{cards.length !== 1 && 's'}.</p>
            <p className="mt-3 text-sm text-muted-foreground">Type the deck name to confirm:</p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={deck.subject}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50" />
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteDeck(false); setDeleteConfirm(''); }} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => { if (deleteConfirm === deck.subject) onDeleteDeck(); }}
                disabled={deleteConfirm !== deck.subject}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 transition-colors">
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
