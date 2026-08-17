import { formatCurrency } from '@/utils/dateUtils';
import { TrendingUp, DollarSign, Activity, PauseCircle } from 'lucide-react';

interface Props {
  monthlyTotal: number;
  annualProjection: number;
  activeCount: number;
  pausedCount: number;
  hasMixedCurrencies: boolean;
}

export function StatsRow({ monthlyTotal, annualProjection, activeCount, pausedCount, hasMixedCurrencies }: Props) {
  const cards = [
    { label: 'Monthly Total', value: formatCurrency(monthlyTotal, 'USD'), icon: DollarSign, accent: 'text-primary' },
    { label: 'Annual Projection', value: formatCurrency(annualProjection, 'USD'), icon: TrendingUp, accent: 'text-accent' },
    { label: 'Active', value: String(activeCount), icon: Activity, accent: 'text-accent' },
    { label: 'Paused', value: String(pausedCount), icon: PauseCircle, accent: 'text-amber-400' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`w-5 h-5 ${c.accent}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${c.accent}`}>{c.value}</p>
          </div>
        ))}
      </div>
      {hasMixedCurrencies && (
        <p className="text-xs text-amber-400 mt-2">⚠ Totals shown in USD (mixed currencies detected)</p>
      )}
    </div>
  );
}
