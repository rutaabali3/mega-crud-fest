import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useShoots } from '@/hooks/use-shoots-context';

const CalendarView = () => {
  const { shoots } = useShoots();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const startPadding = getDay(start); // 0=Sun

  const shootsByDate = useMemo(() => {
    const map = new Map<string, typeof shoots>();
    shoots.forEach(s => {
      const key = format(new Date(s.date), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [shoots]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] bg-muted/30 p-2 sm:min-h-[100px]" />
        ))}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const daysShoots = shootsByDate.get(key) || [];
          const isToday = isSameDay(day, new Date());

          return (
            <div key={key} className={cn('min-h-[80px] bg-card p-2 sm:min-h-[100px]', isToday && 'bg-primary/5')}>
              <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                isToday && 'bg-primary text-primary-foreground font-bold'
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {daysShoots.slice(0, 2).map(s => (
                  <Link key={s.id} to={`/shoots/${s.id}`}>
                    <div className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary truncate hover:bg-primary/20 transition-colors">
                      <Camera className="h-3 w-3 shrink-0" />
                      <span className="truncate">{s.client}</span>
                    </div>
                  </Link>
                ))}
                {daysShoots.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{daysShoots.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
