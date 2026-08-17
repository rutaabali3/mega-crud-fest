import { useState, useMemo } from 'react';
import { Plus, Search, MoreVertical, BookOpen, Trash2, Pencil, Layers } from 'lucide-react';
import type { Deck, Card, DeckColor } from '@/types/flashcard';
import { DECK_COLORS } from '@/types/flashcard';
import { relativeDate, formatFullDate } from '@/lib/dateUtils';

function getDeckColorValue(color: DeckColor): string {
  return DECK_COLORS.find(c => c.name === color)?.value || '#6366F1';
}

function MasteryRing({ percentage, color, size = 48 }: { percentage: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-500" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground text-[10px] font-bold transform rotate-90" style={{ transformOrigin: 'center' }}>
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

interface DecksViewProps {
  decks: Deck[];
  cards: Card[];
  onSelectDeck: (id: string) => void;
  onCreateDeck: (subject: string, color: DeckColor) => void;
  onDeleteDeck: (id: string) => void;
  onEditDeck: (id: string, subject: string, color: DeckColor) => void;
  onStudyDeck: (id: string, mode: 'all' | 'due') => void;
}

export default function DecksView({ decks, cards, onSelectDeck, onCreateDeck, onDeleteDeck, onEditDeck, onStudyDeck }: DecksViewProps) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<DeckColor>('indigo');
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = useMemo(() =>
    decks.filter(d => d.subject.toLowerCase().includes(search.toLowerCase())),
    [decks, search]
  );

  function getMastery(deckId: string) {
    const deckCards = cards.filter(c => c.deckId === deckId);
    if (deckCards.length === 0) return 0;
    const total = deckCards.reduce((sum, c) => {
      if (c.difficulty === 'easy') return sum + 100;
      if (c.difficulty === 'medium') return sum + 50;
      return sum;
    }, 0);
    return total / deckCards.length;
  }

  function getDueCount(deckId: string) {
    const now = new Date().toISOString();
    return cards.filter(c => c.deckId === deckId && c.nextReview <= now).length;
  }

  function openCreate() {
    setEditingDeck(null);
    setNewName('');
    setNewColor('indigo');
    setError('');
    setShowModal(true);
  }

  function openEdit(deck: Deck) {
    setEditingDeck(deck);
    setNewName(deck.subject);
    setNewColor(deck.color);
    setError('');
    setShowModal(true);
    setMenuOpen(null);
  }

  function handleSave() {
    const trimmed = newName.trim();
    if (!trimmed) { setError('Name is required'); return; }
    if (trimmed.length > 50) { setError('Max 50 characters'); return; }
    const duplicate = decks.find(d => d.subject.toLowerCase() === trimmed.toLowerCase() && d.id !== editingDeck?.id);
    if (duplicate) { setError('A deck with this name already exists'); return; }

    if (editingDeck) {
      onEditDeck(editingDeck.id, trimmed, newColor);
    } else {
      onCreateDeck(trimmed, newColor);
    }
    setShowModal(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Your Decks</h1>
          <p className="text-sm text-muted-foreground">{decks.length} deck{decks.length !== 1 && 's'} · {cards.length} total cards</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="w-4 h-4" /> New Deck
        </button>
      </div>

      {/* Search */}
      {decks.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search decks..." className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(deck => {
            const cardCount = cards.filter(c => c.deckId === deck.id).length;
            const mastery = getMastery(deck.id);
            const dueCount = getDueCount(deck.id);
            const colorVal = getDeckColorValue(deck.color);
            return (
              <div key={deck.id} onClick={() => onSelectDeck(deck.id)}
                className="hover-lift relative cursor-pointer rounded-xl border border-border bg-card overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: colorVal }} />
                <div className="p-5 pl-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-foreground truncate">{deck.subject}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{cardCount} card{cardCount !== 1 && 's'}</span>
                        {dueCount > 0 && (
                          <span className="rounded-md bg-amber/10 px-2 py-0.5 text-xs font-medium" style={{ color: '#F59E0B' }}>{dueCount} due</span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground" title={formatFullDate(deck.lastStudied)}>
                        {deck.lastStudied ? `Studied ${relativeDate(deck.lastStudied)}` : 'Not yet studied'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MasteryRing percentage={mastery} color={colorVal} />
                      <div className="relative">
                        <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === deck.id ? null : deck.id); }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === deck.id && (
                          <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-border bg-popover py-1 shadow-lg animate-scale-in"
                            onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(deck)} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary">
                              <Pencil className="w-3.5 h-3.5" /> Edit Deck
                            </button>
                            <button onClick={() => { onStudyDeck(deck.id, 'all'); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary">
                              <BookOpen className="w-3.5 h-3.5" /> Study Now
                            </button>
                            <button onClick={() => { onDeleteDeck(deck.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary">
                              <Trash2 className="w-3.5 h-3.5" /> Delete Deck
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Layers className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">No decks yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Create your first deck to get started!</p>
          <button onClick={openCreate}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Create Deck
          </button>
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">No decks match "{search}"</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Escape') setShowModal(false); }}>
            <h2 className="font-display text-lg font-semibold text-foreground">{editingDeck ? 'Edit Deck' : 'Create New Deck'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Subject Name</label>
                <input value={newName} onChange={e => { setNewName(e.target.value); setError(''); }} maxLength={50}
                  autoFocus placeholder="e.g. Organic Chemistry"
                  className={`mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${error ? 'border-destructive' : 'border-border'}`}
                  onKeyDown={e => { if (e.key === 'Enter') handleSave(); }} />
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="mt-2 flex gap-2.5">
                  {DECK_COLORS.map(c => (
                    <button key={c.name} onClick={() => setNewColor(c.name)}
                      className={`h-8 w-8 rounded-full transition-all ${newColor === c.name ? 'ring-2 ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                {editingDeck ? 'Save Changes' : 'Create Deck'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
