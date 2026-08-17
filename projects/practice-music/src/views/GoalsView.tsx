import { useState, useMemo } from 'react';
import { Target } from 'lucide-react';
import { format, startOfWeek, subWeeks, addDays } from 'date-fns';
import type { Goal, Session, Settings } from '../utils/storage';
import { generateId } from '../utils/storage';
import { getWeekStart, getWeekEnd } from '../utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { EmptyState } from '../components/EmptyState';

interface Props {
  goals: Goal[];
  sessions: Session[];
  settings: Settings;
  onUpdateGoals: (g: Goal[]) => void;
  onUpdateSettings: (s: Settings) => void;
}

export function GoalsView({ goals, sessions, settings, onUpdateGoals, onUpdateSettings }: Props) {
  const [targetMinutes, setTargetMinutes] = useState(settings.weeklyGoalMinutes);

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const thisWeekSessions = sessions.filter(s => s.date >= weekStart && s.date <= weekEnd);
  const thisWeekMinutes = thisWeekSessions.reduce((a, s) => a + s.durationMinutes, 0);
  const pct = Math.min(100, Math.round((thisWeekMinutes / settings.weeklyGoalMinutes) * 100));
  const instruments = [...new Set(thisWeekSessions.map(s => s.instrument))];

  // Past 10 weeks
  const history = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const ws = startOfWeek(subWeeks(now, i + 1), { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      const startStr = format(ws, 'yyyy-MM-dd');
      const endStr = format(we, 'yyyy-MM-dd');
      const mins = sessions.filter(s => s.date >= startStr && s.date <= endStr).reduce((a, s) => a + s.durationMinutes, 0);
      return {
        weekLabel: `${format(ws, 'MMM d')} – ${format(we, 'MMM d')}`,
        target: settings.weeklyGoalMinutes,
        actual: mins,
        hit: mins >= settings.weeklyGoalMinutes,
      };
    });
  }, [sessions, settings]);

  const handleSave = () => {
    onUpdateSettings({ ...settings, weeklyGoalMinutes: targetMinutes });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Current Week */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-1">Current Week</h2>
        <p className="text-sm text-muted-foreground mb-4">{format(new Date(weekStart + 'T12:00:00'), 'MMM d')} – {format(new Date(weekEnd + 'T12:00:00'), 'MMM d, yyyy')}</p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">{thisWeekMinutes} / {settings.weeklyGoalMinutes} min</span>
            <span className={pct >= 100 ? 'text-success font-bold' : 'text-muted-foreground'}>{pct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
          </div>
          {pct < 100 && <p className="text-xs text-muted-foreground">{settings.weeklyGoalMinutes - thisWeekMinutes} minutes remaining</p>}
          {instruments.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {instruments.map(i => <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{i}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Set Goal */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">Set Weekly Goal</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider value={[targetMinutes]} onValueChange={v => setTargetMinutes(v[0])} min={30} max={600} step={15} className="flex-1" />
            <Input type="number" value={targetMinutes} onChange={e => setTargetMinutes(Number(e.target.value))} className="w-24 bg-muted border-border" min={30} max={600} />
            <span className="text-sm text-muted-foreground">min/week</span>
          </div>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Goal</Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">Goal History</h2>
        {history.every(h => h.actual === 0) ? (
          <EmptyState icon={<Target size={40} />} title="No history yet" description="Practice more to build your history!" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Week</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Target</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Actual</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className={`border-b border-border/50 ${h.hit ? 'bg-success/5' : h.actual > 0 ? 'bg-destructive/5' : ''}`}>
                    <td className="py-2 text-foreground">{h.weekLabel}</td>
                    <td className="py-2 text-right text-muted-foreground">{h.target}m</td>
                    <td className="py-2 text-right text-foreground">{h.actual}m</td>
                    <td className="py-2 text-right">
                      {h.actual === 0 ? <span className="text-muted-foreground">—</span> : h.hit
                        ? <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">✓ Hit</span>
                        : <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">✗ Missed</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
