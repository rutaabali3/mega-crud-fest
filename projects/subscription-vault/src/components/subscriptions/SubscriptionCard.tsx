import { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG, CURRENCY_SYMBOLS } from '@/utils/categoryConfig';
import { formatCurrency } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { Pencil, Pause, Play, Trash2 } from 'lucide-react';

interface Props {
  subscription: Subscription;
  onEdit: (s: Subscription) => void;
  onToggle: (id: string) => void;
  onDelete: (s: Subscription) => void;
}

export function SubscriptionCard({ subscription: s, onEdit, onToggle, onDelete }: Props) {
  const cat = CATEGORY_CONFIG[s.category];
  const isPaused = s.status === 'paused';

  return (
    <div className={`glass-card-hover p-5 flex flex-col gap-3 ${isPaused ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {s.logoUrl ? (
            <img src={s.logoUrl} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: s.color + '30', color: s.color }}>
              {s.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{s.name}</h3>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
              {cat.emoji} {cat.label}
            </span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-accent/20 text-accent'}`}>
          {isPaused ? 'Paused' : 'Active'}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono text-foreground">{formatCurrency(s.amount, s.currency)}</span>
        <span className="text-sm text-muted-foreground">/{s.billingCycle}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Renews {format(new Date(s.renewalDate), 'MMM d, yyyy')}
      </p>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
        <button onClick={() => onEdit(s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button onClick={() => onToggle(s.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={() => onDelete(s)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}
