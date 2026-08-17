import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { Deck, Card, QuizResult, DeckColor } from '@/types/flashcard';
import { DECK_COLORS } from '@/types/flashcard';
import { Layers, CreditCard, Clock, Target } from 'lucide-react';

function getDeckColorValue(color: DeckColor): string {
  return DECK_COLORS.find(c => c.name === color)?.value || '#6366F1';
}

interface Props { decks: Deck[]; cards: Card[]; history: QuizResult[]; }

export default function StatsView({ decks, cards, history }: Props) {
  const now = new Date().toISOString();
  const dueToday = cards.filter(c => c.nextReview <= now).length;
  const mastery = cards.length > 0 ? Math.round(cards.reduce((s, c) => s + (c.difficulty === 'easy' ? 100 : c.difficulty === 'medium' ? 50 : 0), 0) / cards.length) : 0;

  // Line chart data
  const lineData = useMemo(() => {
    const last14 = history.slice(0, 20);
    return last14.map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      [h.deckName]: h.score,
    })).reverse();
  }, [history]);

  const deckNames = useMemo(() => [...new Set(history.map(h => h.deckName))], [history]);

  // Mastery bars
  const masteryData = useMemo(() =>
    decks.map(d => {
      const dc = cards.filter(c => c.deckId === d.id);
      return {
        name: d.subject,
        easy: dc.filter(c => c.difficulty === 'easy').length,
        medium: dc.filter(c => c.difficulty === 'medium').length,
        hard: dc.filter(c => c.difficulty === 'hard').length,
        color: getDeckColorValue(d.color),
      };
    }), [decks, cards]);

  // Donut
  const diffDist = useMemo(() => {
    const e = cards.filter(c => c.difficulty === 'easy').length;
    const m = cards.filter(c => c.difficulty === 'medium').length;
    const h = cards.filter(c => c.difficulty === 'hard').length;
    return [
      { name: 'Easy', value: e, color: '#10B981' },
      { name: 'Medium', value: m, color: '#F59E0B' },
      { name: 'Hard', value: h, color: '#EF4444' },
    ];
  }, [cards]);

  function getGradeColor(score: number) {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  }

  function getGrade(score: number) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  const summaryCards = [
    { icon: Layers, label: 'Total Decks', value: decks.length },
    { icon: CreditCard, label: 'Total Cards', value: cards.length },
    { icon: Clock, label: 'Due Today', value: dueToday },
    { icon: Target, label: 'Mastery', value: `${mastery}%` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Statistics</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {summaryCards.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <s.icon className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score History */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Quiz Score History</h3>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" tick={{ fill: 'hsl(215,17%,63%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'hsl(215,17%,63%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(232,27%,14%)', border: '1px solid hsl(232,20%,20%)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend />
                {deckNames.map((name, i) => {
                  const deck = decks.find(d => d.subject === name);
                  const color = deck ? getDeckColorValue(deck.color) : `hsl(${i * 60}, 70%, 60%)`;
                  return <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={{ r: 3 }} />;
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground py-12 text-center">No quiz history yet</p>}
        </div>

        {/* Difficulty Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Difficulty Distribution</h3>
          {cards.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={diffDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {diffDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(232,27%,14%)', border: '1px solid hsl(232,20%,20%)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-muted-foreground py-12 text-center">No cards yet</p>}
        </div>

        {/* Per-deck mastery */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Per-Deck Breakdown</h3>
          {masteryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(150, masteryData.length * 50)}>
              <BarChart data={masteryData} layout="vertical">
                <XAxis type="number" tick={{ fill: 'hsl(215,17%,63%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215,17%,63%)', fontSize: 11 }} width={150} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(232,27%,14%)', border: '1px solid hsl(232,20%,20%)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="easy" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill="#F59E0B" />
                <Bar dataKey="hard" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground py-12 text-center">No decks yet</p>}
        </div>
      </div>

      {/* Recent History Table */}
      {history.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <h3 className="font-display text-sm font-semibold text-foreground p-5 pb-3">Recent Quiz History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Deck', 'Date', 'Score', 'Cards', 'Time', 'Grade'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map(h => (
                  <tr key={h.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{h.deckName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-foreground">{h.score}%</td>
                    <td className="px-5 py-3 text-muted-foreground">{h.totalCards}</td>
                    <td className="px-5 py-3 text-muted-foreground">{Math.floor(h.durationSeconds / 60)}:{(h.durationSeconds % 60).toString().padStart(2, '0')}</td>
                    <td className={`px-5 py-3 font-bold ${getGradeColor(h.score)}`}>{getGrade(h.score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
