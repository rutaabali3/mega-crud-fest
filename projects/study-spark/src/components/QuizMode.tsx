import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Timer, ChevronDown } from 'lucide-react';
import type { Deck, Card, QuizResult } from '@/types/flashcard';

interface Props {
  decks: Deck[];
  cards: Card[];
  initialDeckId?: string;
  onExit: () => void;
  onSaveResult: (result: Omit<QuizResult, 'id'>) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

type Phase = 'setup' | 'active' | 'results';

export default function QuizMode({ decks, cards, initialDeckId, onExit, onSaveResult }: Props) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [deckId, setDeckId] = useState(initialDeckId || (decks[0]?.id || ''));
  const [numQ, setNumQ] = useState(10);
  const [timePerCard, setTimePerCard] = useState(20);
  const [questions, setQuestions] = useState<{ card: Card; options: string[]; correct: number }[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const deckCards = useMemo(() => cards.filter(c => c.deckId === deckId), [cards, deckId]);

  function startQuiz() {
    const pool = shuffle(deckCards).slice(0, numQ === 0 ? deckCards.length : Math.min(numQ, deckCards.length));
    const qs = pool.map(card => {
      const useTF = deckCards.length < 4;
      if (useTF) {
        const isTrue = Math.random() > 0.5;
        return {
          card,
          options: isTrue ? [card.back, 'False — this is not the correct answer'] : ['True — this is the correct answer', card.back],
          correct: isTrue ? 0 : 1,
        };
      }
      const wrongs = shuffle(deckCards.filter(c => c.id !== card.id)).slice(0, 3).map(c => c.back);
      while (wrongs.length < 3) wrongs.push('No additional answer available');
      const opts = shuffle([card.back, ...wrongs]);
      return { card, options: opts, correct: opts.indexOf(card.back) };
    });
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setQIndex(0);
    setSelected(null);
    setTimer(timePerCard);
    setStartTime(Date.now());
    setPhase('active');
  }

  // Timer
  useEffect(() => {
    if (phase !== 'active' || timePerCard === 0 || selected !== null) return;
    if (timer <= 0) { handleAnswer(null); return; }
    const id = setTimeout(() => setTimer(t => t - 0.1), 100);
    return () => clearTimeout(id);
  }, [phase, timer, timePerCard, selected]);

  const handleAnswer = useCallback((optIndex: number | null) => {
    if (selected !== null) return;
    setSelected(optIndex);
    setAnswers(prev => { const n = [...prev]; n[qIndex] = optIndex; return n; });
    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        setPhase('results');
      } else {
        setQIndex(i => i + 1);
        setSelected(null);
        setTimer(timePerCard);
      }
    }, 1000);
  }, [selected, qIndex, questions.length, timePerCard]);

  // Results
  const results = useMemo(() => {
    if (phase !== 'results') return null;
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const score = Math.round((correct / questions.length) * 100);
    const duration = Math.round((Date.now() - startTime) / 1000);
    const deck = decks.find(d => d.id === deckId);
    return { correct, incorrect: questions.length - correct, score, duration, deckName: deck?.subject || '' };
  }, [phase, questions, answers, startTime, decks, deckId]);

  useEffect(() => {
    if (results) {
      onSaveResult({
        deckId,
        deckName: results.deckName,
        date: new Date().toISOString(),
        totalCards: questions.length,
        correctCount: results.correct,
        incorrectCount: results.incorrect,
        durationSeconds: results.duration,
        score: results.score,
      });
    }
  }, [results !== null]);

  function getGrade(score: number) {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-400' };
    if (score >= 75) return { grade: 'B', color: 'text-emerald-400' };
    if (score >= 60) return { grade: 'C', color: 'text-amber-400' };
    if (score >= 50) return { grade: 'D', color: 'text-amber-400' };
    return { grade: 'F', color: 'text-red-400' };
  }

  // Setup
  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 animate-fade-in">
        <button onClick={onExit} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Quiz Setup</h1>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Select Deck</label>
            <div className="relative mt-1.5">
              <select value={deckId} onChange={e => setDeckId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-card pl-3 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                {decks.map(d => (
                  <option key={d.id} value={d.id}>{d.subject} ({cards.filter(c => c.deckId === d.id).length} cards)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Number of Questions</label>
            <div className="mt-2 flex gap-2">
              {[5, 10, 15, 20, 0].map(n => (
                <button key={n} onClick={() => setNumQ(n)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${numQ === n ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                  {n === 0 ? 'All' : n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Time per Card</label>
            <div className="mt-2 flex gap-2">
              {[10, 20, 30, 0].map(t => (
                <button key={t} onClick={() => setTimePerCard(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${timePerCard === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                  {t === 0 ? 'No limit' : `${t}s`}
                </button>
              ))}
            </div>
          </div>
          <button onClick={startQuiz} disabled={deckCards.length === 0}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors mt-4">
            {deckCards.length === 0 ? 'No cards in this deck' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // Active
  if (phase === 'active') {
    const q = questions[qIndex];
    const timerPct = timePerCard > 0 ? (timer / timePerCard) * 100 : 100;
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background bg-grid-dots">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
          <button onClick={onExit} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Exit</button>
          <span className="text-sm font-medium text-foreground">Question {qIndex + 1} of {questions.length}</span>
          {timePerCard > 0 && <div className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-muted-foreground" /><span className={`text-sm font-mono ${timerPct < 20 ? 'text-red-400' : 'text-foreground'}`}>{Math.ceil(timer)}s</span></div>}
        </div>
        {timePerCard > 0 && (
          <div className="h-1 bg-secondary"><div className={`h-full transition-all duration-100 ${timerPct < 20 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${timerPct}%` }} /></div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
          <p className="font-display text-xl sm:text-2xl font-semibold text-foreground text-center mb-8">{q.card.front}</p>
          <div className="grid gap-3 w-full">
            {q.options.map((opt, i) => {
              let cls = 'border-border bg-card hover:bg-secondary';
              if (selected !== null) {
                if (i === q.correct) cls = 'border-emerald-500/50 bg-emerald-500/10';
                else if (i === selected) cls = 'border-red-500/50 bg-red-500/10';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                  className={`rounded-xl border px-5 py-3.5 text-left text-sm font-medium text-foreground transition-colors ${cls}`}>
                  <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (phase === 'results' && results) {
    const { grade, color } = getGrade(results.score);
    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (results.score / 100) * circumference;
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 animate-fade-in">
        <div className="text-center">
          <svg width="150" height="150" className="mx-auto transform -rotate-90">
            <circle cx="75" cy="75" r="60" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle cx="75" cy="75" r="60" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              className="transition-all duration-1000" />
            <text x="75" y="75" textAnchor="middle" dominantBaseline="central"
              className="fill-foreground font-display text-3xl font-bold transform rotate-90" style={{ transformOrigin: 'center' }}>
              {results.score}%
            </text>
          </svg>
          <p className={`mt-4 font-display text-4xl font-bold ${color}`}>Grade: {grade}</p>
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center"><p className="font-display text-2xl font-bold text-emerald-400">{results.correct}</p><p className="text-xs text-muted-foreground">Correct</p></div>
            <div className="text-center"><p className="font-display text-2xl font-bold text-red-400">{results.incorrect}</p><p className="text-xs text-muted-foreground">Incorrect</p></div>
            <div className="text-center"><p className="font-display text-2xl font-bold text-foreground">{Math.floor(results.duration / 60)}:{(results.duration % 60).toString().padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Time</p></div>
          </div>
        </div>

        {/* Review */}
        <div className="mt-8 space-y-2">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Review</h3>
          {questions.map((q, i) => {
            const correct = answers[i] === q.correct;
            return (
              <div key={i} className={`rounded-lg border px-4 py-3 ${correct ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 text-sm ${correct ? 'text-emerald-400' : 'text-red-400'}`}>{correct ? '✓' : '✗'}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{q.card.front}</p>
                    <p className="text-xs text-muted-foreground mt-1">Answer: {q.card.back}</p>
                    {!correct && answers[i] !== null && <p className="text-xs text-red-400 mt-0.5">You chose: {q.options[answers[i]!]}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <button onClick={onExit} className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">Back to Decks</button>
          <button onClick={() => { setPhase('setup'); setSelected(null); }} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Retake Quiz</button>
        </div>
      </div>
    );
  }

  return null;
}
