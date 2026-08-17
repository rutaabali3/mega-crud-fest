import { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { Card } from '@/types/flashcard';

interface Props {
  cards: Card[];
  deckName: string;
  onExit: () => void;
  onRate: (cardId: string, quality: number) => void;
  onComplete: () => void;
}

export default function StudyView({ cards, deckName, onExit, onRate, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [showConfirm, setShowConfirm] = useState(false);

  const current = cards[index];

  const handleRate = useCallback((quality: number) => {
    if (rated) return;
    setRated(true);
    onRate(current.id, quality);
    if (quality >= 2) setCorrectCount(p => p + 1);
    setTimeout(() => {
      if (index + 1 >= cards.length) {
        setDone(true);
        onComplete();
      } else {
        setIndex(i => i + 1);
        setFlipped(false);
        setRated(false);
      }
    }, 300);
  }, [rated, current, index, cards.length, onRate, onComplete]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (done || showConfirm) return;
      if (e.key === ' ' && !flipped) { e.preventDefault(); setFlipped(true); }
      if (flipped && !rated) {
        if (e.key === '1') handleRate(0);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped, rated, done, showConfirm, handleRate]);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const accuracy = cards.length > 0 ? Math.round((correctCount / cards.length) * 100) : 0;

  if (done) {
    const msg = accuracy >= 90 ? '🔥 Outstanding!' : accuracy >= 70 ? '💪 Great work!' : accuracy >= 50 ? '👍 Keep it up!' : '📚 Practice makes perfect!';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-grid-dots">
        <div className="text-center animate-fade-in">
          <p className="text-5xl mb-4">{msg.split(' ')[0]}</p>
          <h2 className="font-display text-2xl font-bold text-foreground">{msg.split(' ').slice(1).join(' ')}</h2>
          <div className="mt-6 flex justify-center gap-6">
            {[{ label: 'Cards', value: cards.length }, { label: 'Accuracy', value: `${accuracy}%` }, { label: 'Time', value: `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}` }].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">Back to Deck</button>
            <button onClick={() => { setIndex(0); setFlipped(false); setRated(false); setCorrectCount(0); setDone(false); }}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              <RotateCcw className="w-4 h-4" /> Study Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background bg-grid-dots">
      {/* Confirm exit */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl animate-scale-in">
            <h3 className="font-display text-lg font-semibold text-foreground">Leave study session?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your progress will be lost.</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Stay</button>
              <button onClick={onExit} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90">Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={() => setShowConfirm(true)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" /> Exit
        </button>
        <span className="text-sm font-medium text-foreground">{deckName}</span>
        <span className="text-sm text-muted-foreground">{index + 1} / {cards.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1 bg-secondary"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flip-card w-full max-w-xl" style={{ height: '320px' }}>
          <div className={`flip-card-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
            <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-lg cursor-pointer"
              onClick={() => !flipped && setFlipped(true)}>
              <p className="font-display text-xl sm:text-2xl font-semibold text-foreground text-center leading-relaxed">{current.front}</p>
              {!flipped && <p className="mt-6 text-xs text-muted-foreground">Tap to reveal answer</p>}
            </div>
            <div className="flip-card-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-card p-8 shadow-lg">
              <p className="font-display text-xl sm:text-2xl font-semibold text-foreground text-center leading-relaxed">{current.back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      {flipped && !rated && (
        <div className="px-4 pb-8 animate-fade-in">
          <p className="text-center text-xs text-muted-foreground mb-3">How well did you know this?</p>
          <div className="flex justify-center gap-3">
            {[
              { label: '❌ Blackout', q: 0, cls: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20' },
              { label: '😕 Hard', q: 2, cls: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20' },
              { label: '😐 Okay', q: 3, cls: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20' },
              { label: '✅ Easy', q: 4, cls: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20' },
            ].map(b => (
              <button key={b.q} onClick={() => handleRate(b.q)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${b.cls}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
