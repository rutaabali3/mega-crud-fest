import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  occupied: 'bg-success/10 text-success',
  paid: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  in_progress: 'bg-warning/10 text-warning',
  expiring_soon: 'bg-warning/10 text-warning',
  overdue: 'bg-destructive/10 text-destructive',
  archived: 'bg-destructive/10 text-destructive',
  emergency: 'bg-destructive/10 text-destructive',
  vacant: 'bg-destructive/10 text-destructive',
  open: 'bg-info/10 text-info',
  resolved: 'bg-muted text-muted-foreground',
  past: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusColors[status] || 'bg-muted text-muted-foreground')}>
      {label}
    </span>
  );
}
