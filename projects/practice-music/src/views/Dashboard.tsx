import { useMemo } from 'react';
import { Clock, Music, CalendarDays, Flame, Plus } from 'lucide-react';
import type { Piece, Session, Settings } from '../utils/storage';
import { getThisWeekSessions, getTodaySessions, getCurrentStreak, formatDate } from '../utils/dateUtils';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import type { ViewName } from '../App';

interface Props {
  pieces: Piece[];
  sessions: Session[];
  settings: Settings;
  onLogSession: () => void;
  onNavigate: (v: ViewName) => void;
}

const MOOD_EMOJIS = ['😫', '😕', '😐', '😊', '🤩'];

export function Dashboard({ pieces, sessions, settings, onLogSession, onNavigate }: Props) {
  const weekSessions = useMemo(() => getThisWeekSessions(sessions), [sessions]);
  const todaySessions = useMemo(() => getTodaySessions(sessions), [sessions]);
  const streak = useMemo(() => getCurrentStreak(sessions), [sessions]);
  const weekMinutes = weekSessions.reduce((s, x) => s + x.durationMinutes, 0);
  const activePieces = pieces.filter(p => p.status === 'active');
  const recent = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Clock size={20} />} label="This Week" value={`${weekMinutes}`} sub={`/ ${settings.weeklyGoalMinutes} min`} />
        <StatCard icon={<Music size={20} />} label="Active Pieces" value={activePieces.length} color="text-accent" />
        <StatCard icon={<CalendarDays size={20} />} label="Sessions Today" value={todaySessions.length} color="text-secondary" />
        <StatCard icon={<Flame size={20} />} label="Current Streak" value={`${streak}d`} sub="consecutive days" color="text-warning" />
      </div>

      {/* Quick Log */}
      <Button onClick={onLogSession} size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-heading font-bold text-base gap-2 shadow-lg">
        <Plus size={20} /> Log Practice Session
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div>
          <h2 className="font-heading font-semibold text-foreground mb-3">Recent Sessions</h2>
          {recent.length === 0 ? (
            <EmptyState icon={<CalendarDays size={48} />} title="No sessions yet" description="Log your first practice session to start tracking." actionLabel="Log Session" onAction={onLogSession} />
          ) : (
            <div className="space-y-2">
              {recent.map(s => {
                const piece = pieces.find(p => p.id === s.pieceId);
                return (
                  <div key={s.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all">
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: piece?.color || '#6C63FF' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{piece?.title || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{s.instrument} · {formatDate(s.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground font-medium">{s.durationMinutes}m</span>
                      {s.bpmReached > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{s.bpmReached} BPM</span>}
                      <span>{MOOD_EMOJIS[parseInt(s.mood) - 1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Pieces */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-foreground">Active Pieces</h2>
            <button onClick={() => onNavigate('pieces')} className="text-xs text-primary hover:underline">View all →</button>
          </div>
          {activePieces.length === 0 ? (
            <EmptyState icon={<Music size={48} />} title="No pieces yet" description="Add your first piece to start tracking progress." actionLabel="Add Piece" onAction={() => onNavigate('pieces')} />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {activePieces.map(p => {
                const pct = p.targetBPM > 0 ? Math.min(100, Math.round((p.currentBPM / p.targetBPM) * 100)) : 0;
                const pieceSessions = sessions.filter(s => s.pieceId === p.id);
                const lastSession = pieceSessions.sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <div key={p.id} className="min-w-[200px] bg-card border border-border rounded-xl p-4 shrink-0 hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.composer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        p.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                        p.difficulty === 'Intermediate' ? 'bg-warning/20 text-warning' :
                        p.difficulty === 'Advanced' ? 'bg-secondary/20 text-secondary' :
                        'bg-destructive/20 text-destructive'
                      }`}>{p.difficulty}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>BPM: {p.currentBPM}/{p.targetBPM}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                    {lastSession && <p className="text-[10px] text-muted-foreground mt-2">Last: {formatDate(lastSession.date)}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
