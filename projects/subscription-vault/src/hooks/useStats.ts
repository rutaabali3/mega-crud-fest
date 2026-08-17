import { useMemo } from 'react';
import { Subscription } from '@/types/subscription';
import { normalizeToMonthly, daysUntilRenewal, getNextRenewal } from '@/utils/dateUtils';
import { differenceInDays } from 'date-fns';

export function useStats(subscriptions: Subscription[]) {
  return useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const paused = subscriptions.filter(s => s.status === 'paused');

    const monthlyTotal = active.reduce((sum, s) => sum + normalizeToMonthly(s.amount, s.billingCycle), 0);
    const annualProjection = monthlyTotal * 12;

    const currencies = new Set(active.map(s => s.currency));
    const hasMixedCurrencies = currencies.size > 1;

    // Category breakdown
    const categoryBreakdown = active.reduce((acc, s) => {
      const monthly = normalizeToMonthly(s.amount, s.billingCycle);
      if (!acc[s.category]) acc[s.category] = { count: 0, monthly: 0 };
      acc[s.category].count++;
      acc[s.category].monthly += monthly;
      return acc;
    }, {} as Record<string, { count: number; monthly: number }>);

    // Upcoming renewals (next 7 days)
    const upcoming = subscriptions
      .filter(s => s.status === 'active')
      .map(s => {
        const next = getNextRenewal(s.renewalDate, s.billingCycle);
        const days = differenceInDays(next, new Date());
        return { ...s, nextRenewal: next, daysUntil: days };
      })
      .filter(s => s.daysUntil >= 0 && s.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    // Forgotten subscriptions (not edited in 60+ days, still active)
    const forgotten = active.filter(s => {
      const daysSinceEdit = differenceInDays(new Date(), new Date(s.lastEditedAt));
      return daysSinceEdit >= 60;
    });

    // Billing cycle distribution
    const cycleDistribution = subscriptions.reduce((acc, s) => {
      acc[s.billingCycle] = (acc[s.billingCycle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most/least expensive
    const sorted = [...active].sort((a, b) => normalizeToMonthly(b.amount, b.billingCycle) - normalizeToMonthly(a.amount, a.billingCycle));
    const mostExpensive = sorted[0] || null;
    const cheapest = sorted[sorted.length - 1] || null;

    return {
      monthlyTotal,
      annualProjection,
      activeCount: active.length,
      pausedCount: paused.length,
      hasMixedCurrencies,
      categoryBreakdown,
      upcoming,
      forgotten,
      cycleDistribution,
      mostExpensive,
      cheapest,
    };
  }, [subscriptions]);
}
