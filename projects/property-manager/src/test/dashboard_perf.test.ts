import { describe, it, expect } from 'vitest';

// Function representing original logic in Dashboard.tsx calendarDays calculation
function computeCalendarDaysOriginal(
  currentYear: number,
  currentMonth: number,
  payments: any[],
  tenants: any[],
  properties: any[]
) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days: { day: number; dots: { color: string; payment: any; tenant: string; property: string }[] }[] = [];

  for (let i = 0; i < firstDay; i++) days.push({ day: 0, dots: [] });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayPayments = payments.filter(p => p.dueDate === dateStr && p.type === 'rent');
    const dots = dayPayments.map(p => ({
      color: p.status === 'paid' ? 'bg-success' : p.status === 'overdue' ? 'bg-destructive' : 'bg-warning',
      payment: p,
      tenant: tenants.find(t => t.id === p.tenantId)?.name || '—',
      property: properties.find(pr => pr.id === p.propertyId)?.address || '—',
    }));
    days.push({ day: d, dots });
  }
  return days;
}

// Function representing optimized logic using Map lookups
export function computeCalendarDaysOptimized(
  currentYear: number,
  currentMonth: number,
  payments: any[],
  tenants: any[],
  properties: any[]
) {
  const tenantMap = new Map<string, string>(tenants.map(t => [t.id, t.name]));
  const propertyMap = new Map<string, string>(properties.map(p => [p.id, p.address]));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days: { day: number; dots: { color: string; payment: any; tenant: string; property: string }[] }[] = [];

  for (let i = 0; i < firstDay; i++) days.push({ day: 0, dots: [] });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayPayments = payments.filter(p => p.dueDate === dateStr && p.type === 'rent');
    const dots = dayPayments.map(p => ({
      color: p.status === 'paid' ? 'bg-success' : p.status === 'overdue' ? 'bg-destructive' : 'bg-warning',
      payment: p,
      tenant: tenantMap.get(p.tenantId) || '—',
      property: propertyMap.get(p.propertyId) || '—',
    }));
    days.push({ day: d, dots });
  }
  return days;
}

describe('Dashboard Calendar Performance Benchmark', () => {
  it('benchmarks original vs optimized logic', () => {
    const numTenants = 1000;
    const numProperties = 1000;
    const numPayments = 3000;
    const currentYear = 2025;
    const currentMonth = 2; // March

    const tenants = Array.from({ length: numTenants }, (_, i) => ({
      id: `t_${i}`,
      name: `Tenant ${i}`,
    }));

    const properties = Array.from({ length: numProperties }, (_, i) => ({
      id: `p_${i}`,
      address: `Address ${i}`,
    }));

    const payments = Array.from({ length: numPayments }, (_, i) => ({
      id: `pay_${i}`,
      tenantId: `t_${i % numTenants}`,
      propertyId: `p_${i % numProperties}`,
      type: 'rent',
      status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'overdue' : 'pending',
      dueDate: `2025-03-${String((i % 31) + 1).padStart(2, '0')}`,
      amount: 1000 + i,
    }));

    // Warmup
    computeCalendarDaysOriginal(currentYear, currentMonth, payments, tenants, properties);
    computeCalendarDaysOptimized(currentYear, currentMonth, payments, tenants, properties);

    const startOriginal = performance.now();
    const originalResult = computeCalendarDaysOriginal(currentYear, currentMonth, payments, tenants, properties);
    const endOriginal = performance.now();
    const durationOriginal = endOriginal - startOriginal;

    const startOptimized = performance.now();
    const optimizedResult = computeCalendarDaysOptimized(currentYear, currentMonth, payments, tenants, properties);
    const endOptimized = performance.now();
    const durationOptimized = endOptimized - startOptimized;

    console.log(`[BENCHMARK RESULT] Original: ${durationOriginal.toFixed(2)}ms`);
    console.log(`[BENCHMARK RESULT] Optimized: ${durationOptimized.toFixed(2)}ms`);
    console.log(`[BENCHMARK RESULT] Speedup: ${(durationOriginal / durationOptimized).toFixed(2)}x`);

    expect(originalResult).toEqual(optimizedResult);
  });
});
