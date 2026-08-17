import { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG } from '@/utils/categoryConfig';
import { formatCurrency, getRenewalBadgeColor } from '@/utils/dateUtils';
import { format } from 'date-fns';

interface UpcomingSub extends Subscription {
  nextRenewal: Date;
  daysUntil: number;
}

interface Props {
  upcoming: UpcomingSub[];
}

export function UpcomingRenewals({ upcoming }: Props) {
  if (upcoming.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="text-muted-foreground text-sm">No renewals in the next 7 days!</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Upcoming Renewals</h3>
      <div className="space-y-3">
        {upcoming.map(s => {
          const cat = CATEGORY_CONFIG[s.category];
          const badgeClass = getRenewalBadgeColor(s.daysUntil);
          return (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              {s.logoUrl ? (
                <img src={s.logoUrl} alt={s.name} className="w-9 h-9 rounded-lg object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: s.color + '30', color: s.color }}>
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{formatCurrency(s.amount, s.currency)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${badgeClass}`}>
                {s.daysUntil === 0 ? 'Today' : s.daysUntil === 1 ? 'Tomorrow' : `${s.daysUntil} days`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
