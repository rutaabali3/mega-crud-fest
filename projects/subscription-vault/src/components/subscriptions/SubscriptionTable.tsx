import { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG } from '@/utils/categoryConfig';
import { formatCurrency } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { Pencil, Pause, Play, Trash2, ArrowUpDown } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Props {
  subscriptions: Subscription[];
  onEdit: (s: Subscription) => void;
  onToggle: (id: string) => void;
  onDelete: (s: Subscription) => void;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
}

export function SubscriptionTable({ subscriptions, onEdit, onToggle, onDelete, sortKey, sortDir, onSort }: Props) {
  const SortHeader = ({ label, field }: { label: string; field: string }) => (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {label} <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead><SortHeader label="Name" field="name" /></TableHead>
            <TableHead>Category</TableHead>
            <TableHead><SortHeader label="Amount" field="amount" /></TableHead>
            <TableHead>Cycle</TableHead>
            <TableHead><SortHeader label="Renewal" field="renewalDate" /></TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map(s => {
            const cat = CATEGORY_CONFIG[s.category];
            const isPaused = s.status === 'paused';
            return (
              <TableRow key={s.id} className={`border-white/5 ${isPaused ? 'opacity-60' : ''}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: s.color + '30', color: s.color }}>
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                    {cat.emoji} {cat.label}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{formatCurrency(s.amount, s.currency)}</TableCell>
                <TableCell className="capitalize">{s.billingCycle}</TableCell>
                <TableCell>{format(new Date(s.renewalDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-accent/20 text-accent'}`}>
                    {isPaused ? 'Paused' : 'Active'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => onToggle(s.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">{isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}</button>
                    <button onClick={() => onDelete(s)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
