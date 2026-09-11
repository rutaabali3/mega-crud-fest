import { describe, test, expect } from 'vitest';
import { Property, Tenant, Payment, MaintenanceRequest } from '../context/AppContext';

// Generate dummy test data
function generateData(count: number) {
  const properties: Property[] = [];
  const tenants: Tenant[] = [];
  const payments: Payment[] = [];
  const maintenance: MaintenanceRequest[] = [];

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
      status: i % 10 === 0 ? 'vacant' : 'occupied',
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
      dueDate: '2023-05-01',
      paidDate: null,
      status: 'overdue',
      notes: '',
    });

    if (i % 5 === 0) {
      maintenance.push({
        id: `maint-${i}`,
        propertyId: propId,
        title: `Leak ${i}`,
        description: 'Water leak',
        category: 'Plumbing',
        priority: 'emergency',
        status: 'open',
        cost: 200,
        contractorName: 'Bob',
        contractorPhone: '555-1111',
        reportedDate: '2023-05-02',
        resolvedDate: null,
      });
    }
  }

  return { properties, tenants, payments, maintenance };
}

describe('Dashboard performance test', () => {
  test('Alerts computation benchmark', () => {
    const { properties, tenants, payments, maintenance } = generateData(2000);
    const now = new Date();
    const activeTenants = tenants.filter(t => t.status === 'active');
    const overduePayments = payments.filter(p => p.status === 'overdue');

    // Baseline implementation (unoptimized O(N*M))
    const startBaseline = performance.now();
    const baselineAlerts: { type: string; message: string }[] = [];
    activeTenants.forEach(t => {
      const daysLeft = Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / 86400000);
      if (daysLeft > 0 && daysLeft <= 30) baselineAlerts.push({ type: 'error', message: `${t.name}'s lease expires in ${daysLeft} days` });
      else if (daysLeft > 30 && daysLeft <= 60) baselineAlerts.push({ type: 'warning', message: `${t.name}'s lease expires in ${daysLeft} days` });
    });
    overduePayments.forEach(p => {
      const tenant = tenants.find(t => t.id === p.tenantId);
      const prop = properties.find(pr => pr.id === p.propertyId);
      baselineAlerts.push({ type: 'error', message: `$${p.amount} rent overdue — ${tenant?.name} at ${prop?.address}` });
    });
    maintenance.filter(m => m.priority === 'emergency' && m.status !== 'resolved').forEach(m => {
      const prop = properties.find(p => p.id === m.propertyId);
      baselineAlerts.push({ type: 'error', message: `Emergency: ${m.title} at ${prop?.address}` });
    });
    properties.filter(p => p.status === 'vacant').forEach(p => {
      baselineAlerts.push({ type: 'info', message: `${p.address} is currently vacant` });
    });
    const baselineTime = performance.now() - startBaseline;

    // Optimized implementation (O(N) with Map)
    const startOptimized = performance.now();
    const optimizedAlerts: { type: string; message: string }[] = [];
    const tenantMap = new Map(tenants.map(t => [t.id, t]));
    const propertyMap = new Map(properties.map(p => [p.id, p]));

    activeTenants.forEach(t => {
      const daysLeft = Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / 86400000);
      if (daysLeft > 0 && daysLeft <= 30) optimizedAlerts.push({ type: 'error', message: `${t.name}'s lease expires in ${daysLeft} days` });
      else if (daysLeft > 30 && daysLeft <= 60) optimizedAlerts.push({ type: 'warning', message: `${t.name}'s lease expires in ${daysLeft} days` });
    });
    overduePayments.forEach(p => {
      const tenant = tenantMap.get(p.tenantId);
      const prop = propertyMap.get(p.propertyId);
      optimizedAlerts.push({ type: 'error', message: `$${p.amount} rent overdue — ${tenant?.name} at ${prop?.address}` });
    });
    maintenance.filter(m => m.priority === 'emergency' && m.status !== 'resolved').forEach(m => {
      const prop = propertyMap.get(m.propertyId);
      optimizedAlerts.push({ type: 'error', message: `Emergency: ${m.title} at ${prop?.address}` });
    });
    properties.filter(p => p.status === 'vacant').forEach(p => {
      optimizedAlerts.push({ type: 'info', message: `${p.address} is currently vacant` });
    });
    const optimizedTime = performance.now() - startOptimized;

    console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);
    console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);

    expect(optimizedAlerts).toEqual(baselineAlerts);
    expect(optimizedTime).toBeLessThan(baselineTime);
  });
});
