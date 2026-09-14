import { describe, it, expect } from "vitest";

describe("Dashboard lookup performance benchmark", () => {
  it("compares O(N) array find vs O(1) Map lookup", () => {
    // Generate sample dataset
    const numProperties = 1000;
    const numTenants = 1000;
    const numPayments = 5000;

    const properties = Array.from({ length: numProperties }, (_, i) => ({
      id: `prop-${i}`,
      address: `Street ${i}`,
    }));

    const tenants = Array.from({ length: numTenants }, (_, i) => ({
      id: `tenant-${i}`,
      name: `Tenant ${i}`,
    }));

    const payments = Array.from({ length: numPayments }, (_, i) => ({
      id: `pay-${i}`,
      tenantId: `tenant-${i % numTenants}`,
      propertyId: `prop-${i % numProperties}`,
      amount: 1000 + i,
      dueDate: "2025-05-01",
      type: "rent",
      status: "pending",
    }));

    const iterations = 20;

    // 1. O(N) array find baseline
    const startArray = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      payments.map(p => {
        const tenant = tenants.find(t => t.id === p.tenantId);
        const prop = properties.find(pr => pr.id === p.propertyId);
        return { tenantName: tenant?.name, propAddress: prop?.address };
      });
    }
    const endArray = performance.now();
    const arrayTime = endArray - startArray;

    // 2. O(1) Map lookup
    const startMap = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
      const tenantMap = new Map(tenants.map(t => [t.id, t]));
      const propertyMap = new Map(properties.map(p => [p.id, p]));
      payments.map(p => {
        const tenant = tenantMap.get(p.tenantId);
        const prop = propertyMap.get(p.propertyId);
        return { tenantName: tenant?.name, propAddress: prop?.address };
      });
    }
    const endMap = performance.now();
    const mapTime = endMap - startMap;

    console.log(`\n--- BENCHMARK RESULTS ---`);
    console.log(`Array find (O(N)): ${arrayTime.toFixed(2)} ms`);
    console.log(`Map lookup (O(1)): ${mapTime.toFixed(2)} ms`);
    console.log(`Speedup: ${(arrayTime / mapTime).toFixed(2)}x faster`);

    expect(mapTime).toBeLessThan(arrayTime);
  });
});
