import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine, Legend } from 'recharts';
import { format, startOfWeek, subWeeks, addDays, subDays, differenceInDays } from 'date-fns';
import { BarChart3 } from 'lucide-react';
import type { Piece, Session, Settings } from '../utils/storage';
import { EmptyState } from '../components/EmptyState';

interface Props {
  pieces: Piece[];
  sessions: Session[];
  settings: Settings;
}

const CHART_COLORS = ['#6C63FF', '#FF6584', '#43E8C8', '#FBBF24', '#38BDF8', '#F472B6'];

export function AnalyticsView({ pieces, sessions, settings }: Props) {
  // Weekly bar data
  const weeklyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');
      const mins = sessions.filter(s => s.date >= startStr && s.date <= endStr).reduce((a, s) => a + s.durationMinutes, 0);
      return { week: format(weekStart, 'MMM d'), minutes: mins };
    });
  }, [sessions]);

  // Per-piece BPM line data
  const bpmData = useMemo(() => {
    const activePieces = pieces.filter(p => p.status !== 'abandoned').slice(0, 6);
    const allDates = [...new Set(sessions.filter(s => activePieces.some(p => p.id === s.pieceId)).map(s => s.date))].sort();
    return allDates.map(date => {
      const point: Record<string, any> = { date: format(new Date(date + 'T12:00:00'), 'MMM d') };
      activePieces.forEach(p => {
        const s = sessions.find(x => x.pieceId === p.id && x.date === date);
        if (s) point[p.title] = s.bpmReached;
      });
      return point;
    });
  }, [pieces, sessions]);

  const activePiecesForChart = pieces.filter(p => p.status !== 'abandoned').slice(0, 6);

  // Instrument pie data
  const instrumentData = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => { map[s.instrument] = (map[s.instrument] || 0) + s.durationMinutes; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  const totalMinutes = sessions.reduce((a, s) => a + s.durationMinutes, 0);

  // Streak heatmap data (last 52 weeks)
  const streakData = useMemo(() => {
    const today = new Date();
    const data: { date: string; minutes: number; col: number; row: number }[] = [];
    const totalDays = 52 * 7;
    const start = subDays(today, totalDays - 1);
    const minuteMap: Record<string, number> = {};
    sessions.forEach(s => { minuteMap[s.date] = (minuteMap[s.date] || 0) + s.durationMinutes; });

    for (let i = 0; i < totalDays; i++) {
      const d = addDays(start, i);
      const key = format(d, 'yyyy-MM-dd');
      data.push({ date: key, minutes: minuteMap[key] || 0, col: Math.floor(i / 7), row: i % 7 });
    }
    return data;
  }, [sessions]);

  if (sessions.length === 0) {
    return <EmptyState icon={<BarChart3 size={48} />} title="No data yet" description="Log some practice sessions to see analytics." />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Weekly Practice */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-heading font-semibold text-foreground mb-4">Weekly Practice Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3347" />
            <XAxis dataKey="week" tick={{ fill: '#8892A4', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1E2535', border: '1px solid #2A3347', borderRadius: 8, color: '#F0F4FF' }} />
            <ReferenceLine y={settings.weeklyGoalMinutes} stroke="#43E8C8" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#43E8C8', fontSize: 11 }} />
            <Bar dataKey="minutes" fill="#6C63FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* BPM Progress */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-heading font-semibold text-foreground mb-4">BPM Progress by Piece</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bpmData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3347" />
              <XAxis dataKey="date" tick={{ fill: '#8892A4', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8892A4', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E2535', border: '1px solid #2A3347', borderRadius: 8, color: '#F0F4FF' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8892A4' }} />
              {activePiecesForChart.map((p, i) => (
                <Line key={p.id} type="monotone" dataKey={p.title} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Instrument Pie */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-heading font-semibold text-foreground mb-4">Time per Instrument</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={instrumentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {instrumentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E2535', border: '1px solid #2A3347', borderRadius: 8, color: '#F0F4FF' }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-muted-foreground mt-2">Total: {totalMinutes} minutes</p>
        </div>
      </div>

      {/* Streak Heatmap */}
      <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
        <h3 className="font-heading font-semibold text-foreground mb-4">Practice Streak</h3>
        <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `repeat(52, 12px)`, gridTemplateRows: `repeat(7, 12px)` }}>
          {streakData.map((d, i) => {
            const intensity = d.minutes === 0 ? 'bg-muted' : d.minutes < 15 ? 'bg-[#312e81]' : d.minutes < 30 ? 'bg-[#4c1d95]' : d.minutes < 60 ? 'bg-primary' : 'bg-[#a5b4fc]';
            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${intensity}`}
                style={{ gridColumn: d.col + 1, gridRow: d.row + 1 }}
                title={`${d.date}: ${d.minutes}m`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
