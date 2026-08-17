import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useStats } from '@/hooks/useStats';
import { SpendBarChart } from '@/components/charts/SpendBarChart';
import { DonutChart, CYCLE_COLORS } from '@/components/charts/DonutChart';
import { CATEGORY_CONFIG } from '@/utils/categoryConfig';
import { normalizeToMonthly, formatCurrency } from '@/utils/dateUtils';
import { format, subMonths } from 'date-fns';
import { useMemo } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Analytics = () => {
  const { subscriptions } = useSubscriptions();
  const stats = useStats(subscriptions);

  // Last 6 months spend
  const barData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const month = subMonths(now, 5 - i);
      return {
        month: format(month, 'MMM'),
        amount: Math.round(stats.monthlyTotal * 100) / 100,
      };
    });
  }, [stats.monthlyTotal]);

  // Cycle distribution
  const cycleData = useMemo(() => {
    return Object.entries(stats.cycleDistribution).map(([cycle, count]) => ({
      name: cycle.charAt(0).toUpperCase() + cycle.slice(1),
      value: count,
      color: CYCLE_COLORS[cycle] || '#94A3B8',
    }));
  }, [stats.cycleDistribution]);

  // Category table
  const categoryRows = useMemo(() => {
    return Object.entries(stats.categoryBreakdown).map(([cat, data]) => ({
      category: cat,
      label: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].label,
      emoji: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].emoji,
      color: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG].color,
      count: data.count,
      monthly: data.monthly,
      percent: stats.monthlyTotal > 0 ? (data.monthly / stats.monthlyTotal) * 100 : 0,
    }));
  }, [stats.categoryBreakdown, stats.monthlyTotal]);

  // Year progress
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
  const yearProgress = (dayOfYear / 365) * 100;
  const ytdSpent = stats.monthlyTotal * (dayOfYear / 30.44);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed spending insights</p>
      </div>

      {/* Most/Least expensive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.mostExpensive && (
          <div className="glass-card-hover p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Most Expensive</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.mostExpensive.name}</p>
            <p className="font-mono text-xl text-destructive">{formatCurrency(normalizeToMonthly(stats.mostExpensive.amount, stats.mostExpensive.billingCycle), 'USD')}<span className="text-sm text-muted-foreground">/mo</span></p>
          </div>
        )}
        {stats.cheapest && (
          <div className="glass-card-hover p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Cheapest</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{stats.cheapest.name}</p>
            <p className="font-mono text-xl text-accent">{formatCurrency(normalizeToMonthly(stats.cheapest.amount, stats.cheapest.billingCycle), 'USD')}<span className="text-sm text-muted-foreground">/mo</span></p>
          </div>
        )}
      </div>

      {/* Annual Projection */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-foreground mb-3">Annual Projection</h3>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-muted-foreground">Year to date: <span className="font-mono text-foreground">{formatCurrency(ytdSpent, 'USD')}</span></span>
          <span className="text-sm text-muted-foreground">Projected: <span className="font-mono text-foreground">{formatCurrency(stats.annualProjection, 'USD')}</span></span>
        </div>
        <div className="w-full h-3 rounded-full bg-background/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${Math.min(yearProgress, 100)}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{yearProgress.toFixed(0)}% of year elapsed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendBarChart data={barData} />
        <DonutChart data={cycleData} title="Billing Cycle Distribution" />
      </div>

      {/* Category breakdown table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-semibold text-foreground">Category Breakdown</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Category</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Monthly Cost</TableHead>
              <TableHead>% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryRows.map(r => (
              <TableRow key={r.category} className="border-white/5">
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: r.color }}>
                    {r.emoji} {r.label}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{r.count}</TableCell>
                <TableCell className="font-mono">{formatCurrency(r.monthly, 'USD')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-background/50 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.percent}%`, backgroundColor: r.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{r.percent.toFixed(0)}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Analytics;
