import { useState, useMemo } from 'react';
import { BookOpen, List, LayoutGrid } from 'lucide-react';
import type { Deck, Card, DeckColor } from '@/types/flashcard';
import { DECK_COLORS } from '@/types/flashcard';
import { dueStatus, formatFullDate } from '@/lib/dateUtils';

function getDeckColorValue(color: DeckColor): string {
  return DECK_COLORS.find(c => c.name === color)?.value || '#6366F1';
}

const difficultyColors = { easy: 'bg-emerald-500/10 text-emerald-400', medium: 'bg-amber-500/10 text-amber-400', hard: 'bg-red-500/10 text-red-400' };

interface Props {
  decks: Deck[];
  cards: Card[];
  onStudyAll: (cardIds: string[]) => void;
}

export default function ReviewQueue({ decks, cards, onStudyAll }: Props) {
  const [grouped, setGrouped] = useState(false);
  const now = new Date().toISOString();

  const dueCards = useMemo(() =>
    cards.filter(c => c.nextReview <= now).sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()),
    [cards, now]
  );

  const deckCount = useMemo(() => new Set(dueCards.map(c => c.deckId)).size, [dueCards]);
  const groupedCards = useMemo(() => {
    const map = new Map<string, Card[]>();
    dueCards.forEach(c => {
      const arr = map.get(c.deckId) || [];
      arr.push(c);
      map.set(c.deckId, arr);
    });
    return map;
  }, [dueCards]);

  function getDeck(id: string) { return decks.find(d => d.id === id); }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Review Queue</h1>
          <p className="text-sm text-muted-foreground">{dueCards.length} card{dueCards.length !== 1 && 's'} due across {deckCount} deck{deckCount !== 1 && 's'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGrouped(!grouped)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            {grouped ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            {grouped ? 'Flat List' : 'Group by Deck'}
          </button>
          <button onClick={() => onStudyAll(dueCards.map(c => c.id))} disabled={dueCards.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors">
            <BookOpen className="w-4 h-4" /> Study All Due
          </button>
        </div>
      </div>

      {dueCards.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">All caught up!</h2>
          <p className="mt-2 text-sm text-muted-foreground">No cards due for review right now.</p>
        </div>
      ) : grouped ? (
        <div className="space-y-6">
          {Array.from(groupedCards.entries()).map(([deckId, deckCards]) => {
            const deck = getDeck(deckId);
            if (!deck) return null;
            return (
              <div key={deckId}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getDeckColorValue(deck.color) }} />
                  <h3 className="font-display text-sm font-semibold text-foreground">{deck.subject}</h3>
                  <span className="text-xs text-muted-foreground">({deckCards.length})</span>
                </div>
                <div className="space-y-1.5">
                  {deckCards.map(card => <CardRow key={card.id} card={card} deck={deck} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1.5">
          {dueCards.map(card => <CardRow key={card.id} card={card} deck={getDeck(card.deckId)} />)}
        </div>
      )}
    </div>
  );
}

function CardRow({ card, deck }: { card: Card; deck?: Deck }) {
  const due = dueStatus(card.nextReview);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-secondary/50 transition-colors">
      {deck && (
        <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: getDeckColorValue(deck.color) + '15', color: getDeckColorValue(deck.color) }}>
          {deck.subject}
        </span>
      )}
      <span className="text-sm text-foreground truncate flex-1">{card.front}</span>
      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${difficultyColors[card.difficulty]}`}>{card.difficulty}</span>
      <span className={`shrink-0 text-xs ${due.color}`} title={formatFullDate(card.nextReview)}>{due.text}</span>
    </div>
  );
}
