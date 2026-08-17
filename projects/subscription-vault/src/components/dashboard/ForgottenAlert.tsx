import { Subscription } from '@/types/subscription';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  forgotten: Subscription[];
  onReview: (s: Subscription) => void;
}

export function ForgottenAlert({ forgotten, onReview }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || forgotten.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="font-semibold text-destructive">Forgotten Subscriptions?</h3>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        These active subscriptions haven't been reviewed in over 60 days.
      </p>
      <div className="space-y-2">
        {forgotten.map(s => (
          <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
            <span className="text-sm text-foreground">{s.name}</span>
            <button onClick={() => onReview(s)} className="text-xs px-3 py-1 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
