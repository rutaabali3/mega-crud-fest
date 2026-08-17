import { BillingCycle } from '@/types/subscription';
import { differenceInDays, addMonths, addWeeks, addYears, addQuarters, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, isToday, isSameDay, isSameMonth } from 'date-fns';

export function normalizeToMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly': return amount * 4.33;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
  }
}

export function daysUntilRenewal(renewalDate: string): number {
  return differenceInDays(new Date(renewalDate), new Date());
}

export function getNextRenewal(renewalDate: string, cycle: BillingCycle): Date {
  let date = new Date(renewalDate);
  const now = new Date();
  const addFn = cycle === 'weekly' ? addWeeks : cycle === 'monthly' ? addMonths : cycle === 'quarterly' ? addQuarters : addYears;
  while (date < now) {
    date = addFn(date, 1);
  }
  return date;
}

export function getRenewalBadgeColor(days: number): string {
  if (days <= 1) return 'bg-destructive text-destructive-foreground';
  if (days <= 4) return 'bg-amber-500/20 text-amber-400';
  return 'bg-accent/20 text-accent';
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isToday, isSameDay, isSameMonth, differenceInDays };
