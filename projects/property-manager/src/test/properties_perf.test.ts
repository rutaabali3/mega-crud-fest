import { describe, test, expect } from 'vitest';
import { Property, Tenant } from '../context/AppContext';

function generateTestData(propertyCount: number, tenantCount: number) {
  const properties: Property[] = Array.from({ length: propertyCount }, (_, i) => ({
    id: `prop-${i}`,
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
    createdAt: new Date().toISOString(),
  }));

  const tenants: Tenant[] = Array.from({ length: tenantCount }, (_, i) => ({
    id: `tenant-${i}`,
    propertyId: `prop-${i % propertyCount}`,
    name: `Tenant ${i}`,
    email: `tenant${i}@example.com`,
    phone: '555-0000',
    leaseStart: '2023-01-01',
    leaseEnd: '2025-12-31',
    monthlyRent: 1500,
    depositHeld: 1500,
    depositReturned: false,
    notes: '',
    status: i % 2 === 0 ? 'active' : 'archived',
  }));

  return { properties, tenants };
}

describe('Properties list tenant lookup performance benchmark', () => {
  test('compares array find O(N*M) vs Map lookup O(N)', () => {
    const { properties, tenants } = generateTestData(1000, 2000);
    const iterations = 50;

    // 1. Array find baseline (O(N*M))
    const startBaseline = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      properties.map(p => {
        const activeTenant = tenants.find(t => t.propertyId === p.id && t.status === 'active');
        return { propertyId: p.id, tenantName: activeTenant?.name };
      });
    }
    const baselineTime = performance.now() - startBaseline;

    // 2. Map lookup optimized (O(N))
    const startOptimized = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      const activeTenantMap = new Map<string, Tenant>();
      for (const t of tenants) {
        if (t.status === 'active' && !activeTenantMap.has(t.propertyId)) {
          activeTenantMap.set(t.propertyId, t);
        }
      }
      properties.map(p => {
        const activeTenant = activeTenantMap.get(p.id);
        return { propertyId: p.id, tenantName: activeTenant?.name };
      });
    }
    const optimizedTime = performance.now() - startOptimized;

    console.log(`\n--- PROPERTIES BENCHMARK RESULTS ---`);
    console.log(`Array find baseline (O(N*M)): ${baselineTime.toFixed(2)} ms`);
    console.log(`Map lookup optimized (O(N)): ${optimizedTime.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineTime / optimizedTime).toFixed(2)}x faster`);

    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
