import { describe, test, expect } from 'vitest';
import { Property, Tenant, Payment } from '../context/AppContext';

function generateData(count: number) {
  const properties: Property[] = [];
  const tenants: Tenant[] = [];
  const payments: Payment[] = [];

  for (let i = 0; i < count; i++) {
    const propId = `prop-${i}`;
    const tenantId = `tenant-${i}`;
    properties.push({
      id: propId,
      address: `${i} Main St`,
      unit: '1A',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 800,
      purchasePrice: 200000,
      monthlyMortgage: 1000,
      photoUrl: '',
      status: 'occupied',
      createdAt: '2023-01-01',
    });

    tenants.push({
      id: tenantId,
      propertyId: propId,
      name: `Tenant ${i}`,
      email: `tenant${i}@example.com`,
      phone: '555-0000',
      leaseStart: '2023-01-01',
      leaseEnd: '2025-12-31',
      monthlyRent: 1500,
      depositHeld: 1500,
      depositReturned: false,
      notes: '',
      status: 'active',
    });

    payments.push({
      id: `pay-${i}`,
      propertyId: propId,
      tenantId: tenantId,
      amount: 1500,
      type: 'rent',
      dueDate: '2025-05-01',
      paidDate: null,
      status: 'pending',
      notes: '',
    });
  }

  return { properties, tenants, payments };
}

describe('Payments table lookup performance benchmark', () => {
  test('compares O(N) array find vs O(1) Map lookup for rendering payment rows', () => {
    const { properties, tenants, payments } = generateData(2000);
    const iterations = 50;

    // Baseline: Array find (O(N))
    const startBaseline = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      payments.map(p => {
        const propAddress = properties.find(pr => pr.id === p.propertyId)?.address || '—';
        const tenantName = tenants.find(t => t.id === p.tenantId)?.name || '—';
        return { propAddress, tenantName };
      });
    }
    const baselineTime = performance.now() - startBaseline;

    // Optimized: Map lookup (O(1))
    const startOptimized = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      const propertyMap = new Map(properties.map(p => [p.id, p]));
      const tenantMap = new Map(tenants.map(t => [t.id, t]));
      payments.map(p => {
        const propAddress = propertyMap.get(p.propertyId)?.address || '—';
        const tenantName = tenantMap.get(p.tenantId)?.name || '—';
        return { propAddress, tenantName };
      });
    }
    const optimizedTime = performance.now() - startOptimized;

    console.log(`\n--- PAYMENTS BENCHMARK RESULTS ---`);
    console.log(`Baseline array find (O(N)): ${baselineTime.toFixed(2)} ms`);
    console.log(`Optimized Map lookup (O(1)): ${optimizedTime.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineTime / optimizedTime).toFixed(2)}x faster`);

    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
