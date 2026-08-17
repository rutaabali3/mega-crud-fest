import type { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ icon, label, value, sub, color = 'text-primary' }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 shadow-lg shadow-primary/5 transition-all duration-200 hover:border-primary/30">
      <div className={`p-2 rounded-lg bg-muted ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
