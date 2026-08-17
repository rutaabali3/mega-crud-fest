import { useMemo } from "react";
import { Bottle, BOTTLE_TYPES, TYPE_ICONS } from "@/types/bottle";

interface StatsHeaderProps {
  bottles: Bottle[];
}

export function StatsHeader({ bottles }: StatsHeaderProps) {
  const active = useMemo(() => bottles.filter(b => !b.isFinished), [bottles]);

  const totalBottles = useMemo(() => active.reduce((s, b) => s + b.quantity, 0), [active]);
  const totalValue = useMemo(() => active.reduce((s, b) => s + b.pricePaid * b.quantity, 0), [active]);
  const avgRating = useMemo(() => {
    if (!active.length) return 0;
    return Math.round(active.reduce((s, b) => s + b.rating, 0) / active.length);
  }, [active]);

  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(b => { map[b.type] = (map[b.type] || 0) + b.quantity; });
    return map;
  }, [active]);

  const maxCount = Math.max(...Object.values(typeCounts), 1);

  return (
    <div className="glass-card rounded-lg p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-display font-bold text-primary">{totalBottles}</p>
          <p className="text-xs text-muted-foreground">Bottles</p>
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-primary">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Cellar Value</p>
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-primary">{avgRating}</p>
          <p className="text-xs text-muted-foreground">Avg Rating</p>
        </div>
      </div>

      {Object.keys(typeCounts).length > 0 && (
        <div className="space-y-1.5">
          {BOTTLE_TYPES.filter(t => typeCounts[t]).map(t => (
            <div key={t} className="flex items-center gap-2 text-xs">
              <span className="w-20 truncate">{TYPE_ICONS[t]} {t}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(typeCounts[t] / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 text-right text-muted-foreground">{typeCounts[t]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
