import { describe, it, expect } from 'vitest';
import { Property, MaintenanceRequest } from '../context/AppContext';

describe('Maintenance property lookup benchmark', () => {
  it('compares O(N*M) array find vs O(N+M) Map lookup', () => {
    const numProperties = 500;
    const numRequests = 2000;

    const properties: Property[] = Array.from({ length: numProperties }, (_, i) => ({
      id: `prop-${i}`,
      address: `Street ${i}`,
      unit: '1',
      type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 500,
      purchasePrice: 100000,
      monthlyMortgage: 500,
      photoUrl: '',
      status: 'occupied',
      createdAt: '2023-01-01',
    }));

    const maintenance: MaintenanceRequest[] = Array.from({ length: numRequests }, (_, i) => ({
      id: `maint-${i}`,
      propertyId: `prop-${i % numProperties}`,
      title: `Issue ${i}`,
      description: 'Test description',
      category: 'plumbing',
      priority: 'medium',
      status: 'open',
      cost: 100,
      contractorName: 'Bob',
      contractorPhone: '555-0000',
      reportedDate: '2023-01-01',
      resolvedDate: null,
    }));

    const iterations = 10;

    // Baseline: array find inside render / loop
    const startBaseline = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      maintenance.map(m => {
        return properties.find(p => p.id === m.propertyId)?.address;
      });
    }
    const endBaseline = performance.now();
    const baselineTime = endBaseline - startBaseline;

    // Optimized: lookup map constructed once
    const startOptimized = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      const propertyMap = new Map(properties.map(p => [p.id, p]));
      maintenance.map(m => {
        return propertyMap.get(m.propertyId)?.address;
      });
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    console.log(`\n--- MAINTENANCE BENCHMARK ---`);
    console.log(`Baseline array find (O(N*M)): ${baselineTime.toFixed(2)} ms`);
    console.log(`Optimized Map lookup (O(N+M)): ${optimizedTime.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineTime / optimizedTime).toFixed(2)}x faster`);

    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
