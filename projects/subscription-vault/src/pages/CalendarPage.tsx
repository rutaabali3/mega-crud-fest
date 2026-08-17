import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { CATEGORY_CONFIG } from '@/utils/categoryConfig';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, format, isSameDay, isSameMonth, isToday } from 'date-fns';
import { getNextRenewal, formatCurrency } from '@/utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPage = () => {
  const { subscriptions } = useSubscriptions();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  // Map each day to subscriptions renewing that day
  const renewalMap = useMemo(() => {
    const map = new Map<string, typeof subscriptions>();
    const active = subscriptions.filter(s => s.status === 'active');
    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const matching = active.filter(s => {
        const next = getNextRenewal(s.renewalDate, s.billingCycle);
        return isSameDay(next, day);
      });
      if (matching.length > 0) map.set(key, matching);
    });
    return map;
  }, [subscriptions, currentMonth]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Renewals Calendar</h1>
        <p className="text-sm text-muted-foreground">See when your subscriptions renew</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between glass-card p-4">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentMonth(new Date())} className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            Today
          </button>
        </div>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map(d => (
            <div key={d} className="p-3 text-center text-xs font-medium text-muted-foreground border-b border-white/5">
              {d}
            </div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="p-3 min-h-[80px] border-b border-r border-white/5 bg-background/20" />
          ))}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const subs = renewalMap.get(key) || [];
            const today = isToday(day);
            return (
              <Popover key={key}>
                <PopoverTrigger asChild>
                  <button className={`p-2 min-h-[80px] border-b border-r border-white/5 text-left hover:bg-white/5 transition-colors flex flex-col ${today ? 'bg-primary/10' : ''}`}>
                    <span className={`text-sm mb-1 ${today ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {subs.map(s => (
                        <div key={s.id} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} title={s.name} />
                      ))}
                    </div>
                  </button>
                </PopoverTrigger>
                {subs.length > 0 && (
                  <PopoverContent className="glass-card border-white/10 w-64 p-3">
                    <p className="text-xs text-muted-foreground mb-2">{format(day, 'EEEE, MMM d')}</p>
                    <div className="space-y-2">
                      {subs.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: s.color + '30', color: s.color }}>
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{formatCurrency(s.amount, s.currency)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
