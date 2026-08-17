import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import type { Session, Piece } from '../utils/storage';
import { EmptyState } from '../components/EmptyState';

const MOOD_EMOJIS = ['😫', '😕', '😐', '😊', '🤩'];

interface Props {
  sessions: Session[];
  pieces: Piece[];
}

function getIntensityClass(minutes: number): string {
  if (minutes === 0) return 'bg-card';
  if (minutes < 15) return 'bg-[#312e81]';
  if (minutes < 30) return 'bg-[#4c1d95]';
  if (minutes < 45) return 'bg-primary';
  if (minutes < 60) return 'bg-[#818cf8]';
  return 'bg-[#a5b4fc]';
}

export function CalendarView({ sessions, pieces }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const minutesByDay = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      map[s.date] = (map[s.date] || 0) + s.durationMinutes;
    });
    return map;
  }, [sessions]);

  const sessionsByDay = useMemo(() => {
    const map: Record<string, Session[]> = {};
    sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [sessions]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const selectedSessions = selectedDate ? (sessionsByDay[selectedDate] || []) : [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-heading font-bold text-lg text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((d, i) => {
            const key = format(d, 'yyyy-MM-dd');
            const mins = minutesByDay[key] || 0;
            const inMonth = isSameMonth(d, currentMonth);
            const today = isToday(d);
            const selected = selectedDate === key;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(key)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all relative ${
                  !inMonth ? 'opacity-30' : ''
                } ${getIntensityClass(mins)} ${
                  today ? 'ring-2 ring-accent' : ''
                } ${selected ? 'ring-2 ring-primary' : ''} hover:ring-1 hover:ring-primary/50`}
                title={`${format(d, 'MMM d')}: ${mins} min`}
              >
                <span className={`font-medium ${mins > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{format(d, 'd')}</span>
                {mins > 0 && <span className="text-[8px] text-foreground/70">{mins}m</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {[0, 10, 20, 35, 50, 70].map((m, i) => (
          <div key={i} className={`w-4 h-4 rounded ${getIntensityClass(m)}`} />
        ))}
        <span>More</span>
      </div>

      {/* Selected day sessions */}
      {selectedDate && (
        <div>
          <h3 className="font-heading font-semibold text-foreground mb-3">
            Sessions on {format(new Date(selectedDate + 'T12:00:00'), 'MMMM d, yyyy')}
          </h3>
          {selectedSessions.length === 0 ? (
            <EmptyState icon={<CalendarDays size={40} />} title="No sessions" description="No practice sessions on this day." />
          ) : (
            <div className="space-y-2">
              {selectedSessions.map(s => {
                const piece = pieces.find(p => p.id === s.pieceId);
                return (
                  <div key={s.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: piece?.color || '#6C63FF' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{piece?.title || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{s.instrument} · {s.notes}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground">{s.durationMinutes}m</span>
                      {s.bpmReached > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s.bpmReached} BPM</span>}
                      <span>{MOOD_EMOJIS[parseInt(s.mood) - 1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
