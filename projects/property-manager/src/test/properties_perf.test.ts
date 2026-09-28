import { describe, test, expect } from 'vitest';
import { Property, Tenant } from '../context/AppContext';

function generateData(count: number) {
  const properties: Property[] = [];
  const tenants: Tenant[] = [];

  for (let i = 0; i < count; i++) {
    const propId = `prop-${i}`;
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
      status: i % 10 === 0 ? 'vacant' : 'occupied',
      createdAt: '2023-01-01',
    });

    tenants.push({
      id: `tenant-${i}`,
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
      status: i % 2 === 0 ? 'active' : 'inactive',
    });
  }

  return { properties, tenants };
}

describe('Properties active tenant lookup benchmark', () => {
  test('O(N*M) array find vs O(N+M) Map lookup for active tenant per property', () => {
    const { properties, tenants } = generateData(1000);
    const iterations = 50;

    // Baseline O(N*M) - Array.find for each property
    const startBaseline = performance.now();
    let baselineResults: (Tenant | undefined)[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      baselineResults = properties.map(p =>
        tenants.find(t => t.propertyId === p.id && t.status === 'active')
      );
    }
    const baselineTime = performance.now() - startBaseline;

    // Optimized O(N+M) - Map lookup
    const startOptimized = performance.now();
    let optimizedResults: (Tenant | undefined)[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      const activeTenantMap = new Map(
        tenants.filter(t => t.status === 'active').map(t => [t.propertyId, t])
      );
      optimizedResults = properties.map(p => activeTenantMap.get(p.id));
    }
    const optimizedTime = performance.now() - startOptimized;

    console.log(`\n--- PROPERTIES BENCHMARK RESULTS ---`);
    console.log(`Baseline Array find: ${baselineTime.toFixed(2)} ms`);
    console.log(`Optimized Map lookup: ${optimizedTime.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineTime / Math.max(optimizedTime, 0.01)).toFixed(2)}x faster`);

    expect(optimizedResults).toEqual(baselineResults);
    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
