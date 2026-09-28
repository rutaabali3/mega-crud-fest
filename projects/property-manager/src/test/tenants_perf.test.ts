import { describe, test, expect } from 'vitest';
import { Property, Tenant } from '../context/AppContext';

function generateTenantData(numProperties: number, numTenants: number) {
  const properties: Property[] = Array.from({ length: numProperties }, (_, i) => ({
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
    createdAt: '2023-01-01',
  }));

  const tenants: Tenant[] = Array.from({ length: numTenants }, (_, i) => ({
    id: `tenant-${i}`,
    propertyId: `prop-${i % numProperties}`,
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
  }));

  return { properties, tenants };
}

describe('Tenants page property lookup benchmark', () => {
  test('Compares Array.find vs Map lookup for tenant properties', () => {
    const { properties, tenants } = generateTenantData(1000, 2000);
    const iterations = 50;

    // Baseline O(N*M): Array find inside render/mapping
    const startBaseline = performance.now();
    let baselineResult: any[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      baselineResult = tenants.map(t => {
        const prop = properties.find(p => p.id === t.propertyId);
        const totalDays = (new Date(t.leaseEnd).getTime() - new Date(t.leaseStart).getTime()) / 86400000;
        const elapsed = (Date.now() - new Date(t.leaseStart).getTime()) / 86400000;
        const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
        return { propAddress: prop?.address, percent };
      });
    }
    const baselineTime = performance.now() - startBaseline;

    // Optimized O(N+M): Pre-computed Map lookup
    const startOptimized = performance.now();
    let optimizedResult: any[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      const propertyMap = new Map(properties.map(p => [p.id, p]));
      optimizedResult = tenants.map(t => {
        const prop = propertyMap.get(t.propertyId);
        const totalDays = (new Date(t.leaseEnd).getTime() - new Date(t.leaseStart).getTime()) / 86400000;
        const elapsed = (Date.now() - new Date(t.leaseStart).getTime()) / 86400000;
        const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
        return { propAddress: prop?.address, percent };
      });
    }
    const optimizedTime = performance.now() - startOptimized;

    console.log(`\n--- TENANTS BENCHMARK RESULTS ---`);
    console.log(`Baseline Array find: ${baselineTime.toFixed(2)} ms`);
    console.log(`Optimized Map lookup: ${optimizedTime.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineTime / optimizedTime).toFixed(2)}x faster`);

    expect(optimizedResult).toEqual(baselineResult);
    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
