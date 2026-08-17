import { useMemo } from "react";
import { Bottle } from "@/types/bottle";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrinkByAlertsProps {
  bottles: Bottle[];
  dismissedAlerts: string[];
  onDismiss: (id: string) => void;
  onFilterExpiring: () => void;
}

export function DrinkByAlerts({ bottles, dismissedAlerts, onDismiss, onFilterExpiring }: DrinkByAlertsProps) {
  const alerts = useMemo(() => {
    const now = Date.now();
    const active = bottles.filter(b => !b.isFinished && b.drinkByDate && !dismissedAlerts.includes(b.id));
    const overdue: Bottle[] = [];
    const urgent: Bottle[] = [];
    const warning: Bottle[] = [];

    active.forEach(b => {
      const diff = new Date(b.drinkByDate).getTime() - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) overdue.push(b);
      else if (days <= 30) urgent.push(b);
      else if (days <= 90) warning.push(b);
    });

    return { overdue, urgent, warning };
  }, [bottles, dismissedAlerts]);

  const hasAlerts = alerts.overdue.length + alerts.urgent.length + alerts.warning.length > 0;
  if (!hasAlerts) return null;

  const renderGroup = (label: string, bottles: Bottle[], color: string) => {
    if (!bottles.length) return null;
    return (
      <div className={`flex flex-wrap items-center gap-2 rounded-md px-3 py-2 text-xs ${color}`}>
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">{label}:</span>
        {bottles.map(b => {
          const days = Math.ceil((new Date(b.drinkByDate).getTime() - Date.now()) / 86400000);
          return (
            <span key={b.id} className="flex items-center gap-1">
              {b.name} ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`})
              <button onClick={() => onDismiss(b.id)} className="opacity-60 hover:opacity-100" aria-label={`Dismiss alert for ${b.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-1 px-4 pt-2">
      {renderGroup("Past due", alerts.overdue, "bg-destructive/15 text-destructive")}
      {renderGroup("Expiring in 30 days", alerts.urgent, "bg-orange-500/15 text-orange-400")}
      {renderGroup("Expiring in 90 days", alerts.warning, "bg-yellow-500/15 text-yellow-400")}
      <Button variant="link" size="sm" onClick={onFilterExpiring} className="text-xs text-primary px-3">
        View all expiring →
      </Button>
    </div>
  );
}
