import { describe, it, expect, beforeEach } from 'vitest';
import { seedData } from '../lib/seedData';

describe('seedData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  it('populates localStorage with all expected keys', () => {
    seedData();

    expect(localStorage.getItem('rp_properties')).not.toBeNull();
    expect(localStorage.getItem('rp_tenants')).not.toBeNull();
    expect(localStorage.getItem('rp_payments')).not.toBeNull();
    expect(localStorage.getItem('rp_maintenance')).not.toBeNull();
    expect(localStorage.getItem('rp_expenses')).not.toBeNull();
  });

  it('populates rp_properties with valid schema and correct data types', () => {
    seedData();

    const raw = localStorage.getItem('rp_properties');
    const properties = JSON.parse(raw!);

    expect(Array.isArray(properties)).toBe(true);
    expect(properties.length).toBeGreaterThan(0);

    for (const prop of properties) {
      expect(typeof prop.id).toBe('string');
      expect(prop.id.length).toBeGreaterThan(0);
      expect(typeof prop.address).toBe('string');
      expect(prop.address.length).toBeGreaterThan(0);
      expect(typeof prop.unit).toBe('string');
      expect(typeof prop.type).toBe('string');
      expect(typeof prop.bedrooms).toBe('number');
      expect(typeof prop.bathrooms).toBe('number');
      expect(typeof prop.sqft).toBe('number');
      expect(typeof prop.purchasePrice).toBe('number');
      expect(typeof prop.monthlyMortgage).toBe('number');
      expect(typeof prop.photoUrl).toBe('string');
      expect(['occupied', 'vacant']).toContain(prop.status);
      expect(prop.createdAt).toMatch(dateFormatRegex);
    }
  });

  it('populates rp_tenants with valid schema and references existing properties', () => {
    seedData();

    const properties = JSON.parse(localStorage.getItem('rp_properties')!);
    const propertyIds = properties.map((p: { id: string }) => p.id);

    const raw = localStorage.getItem('rp_tenants');
    const tenants = JSON.parse(raw!);

    expect(Array.isArray(tenants)).toBe(true);
    expect(tenants.length).toBeGreaterThan(0);

    for (const tenant of tenants) {
      expect(typeof tenant.id).toBe('string');
      expect(tenant.id.length).toBeGreaterThan(0);
      expect(propertyIds).toContain(tenant.propertyId);
      expect(typeof tenant.name).toBe('string');
      expect(typeof tenant.email).toBe('string');
      expect(typeof tenant.phone).toBe('string');
      expect(tenant.leaseStart).toMatch(dateFormatRegex);
      expect(tenant.leaseEnd).toMatch(dateFormatRegex);
      expect(typeof tenant.monthlyRent).toBe('number');
      expect(typeof tenant.depositHeld).toBe('number');
      expect(typeof tenant.depositReturned).toBe('boolean');
      expect(typeof tenant.notes).toBe('string');
      expect(['active', 'past']).toContain(tenant.status);
    }
  });

  it('populates rp_payments with valid schema, unique UUIDs, and relational integrity', () => {
    seedData();

    const properties = JSON.parse(localStorage.getItem('rp_properties')!);
    const propertyIds = new Set(properties.map((p: { id: string }) => p.id));

    const tenants = JSON.parse(localStorage.getItem('rp_tenants')!);
    const tenantIds = new Set(tenants.map((t: { id: string }) => t.id));

    const raw = localStorage.getItem('rp_payments');
    const payments = JSON.parse(raw!);

    expect(Array.isArray(payments)).toBe(true);
    expect(payments.length).toBeGreaterThan(0);

    const paymentIds = new Set<string>();

    for (const payment of payments) {
      expect(typeof payment.id).toBe('string');
      expect(payment.id.length).toBeGreaterThan(0);
      paymentIds.add(payment.id);

      expect(propertyIds.has(payment.propertyId)).toBe(true);
      expect(tenantIds.has(payment.tenantId)).toBe(true);
      expect(typeof payment.amount).toBe('number');
      expect(payment.amount).toBeGreaterThan(0);
      expect(payment.type).toBe('rent');
      expect(payment.dueDate).toMatch(dateFormatRegex);

      if (payment.paidDate !== null) {
        expect(payment.paidDate).toMatch(dateFormatRegex);
      }

      expect(['paid', 'pending', 'overdue']).toContain(payment.status);
      expect(typeof payment.notes).toBe('string');
    }

    // Check UUID uniqueness across payments
    expect(paymentIds.size).toBe(payments.length);
  });

  it('populates rp_maintenance with valid schema and valid status/priority values', () => {
    seedData();

    const properties = JSON.parse(localStorage.getItem('rp_properties')!);
    const propertyIds = new Set(properties.map((p: { id: string }) => p.id));

    const raw = localStorage.getItem('rp_maintenance');
    const maintenance = JSON.parse(raw!);

    expect(Array.isArray(maintenance)).toBe(true);
    expect(maintenance.length).toBeGreaterThan(0);

    for (const item of maintenance) {
      expect(typeof item.id).toBe('string');
      expect(propertyIds.has(item.propertyId)).toBe(true);
      expect(typeof item.title).toBe('string');
      expect(typeof item.description).toBe('string');
      expect(['plumbing', 'hvac', 'other']).toContain(item.category);
      expect(['low', 'medium', 'high', 'emergency']).toContain(item.priority);
      expect(['open', 'in_progress', 'resolved']).toContain(item.status);
      expect(typeof item.cost).toBe('number');
      expect(typeof item.contractorName).toBe('string');
      expect(typeof item.contractorPhone).toBe('string');
      expect(item.reportedDate).toMatch(dateFormatRegex);

      if (item.resolvedDate !== null) {
        expect(item.resolvedDate).toMatch(dateFormatRegex);
      }
    }
  });

  it('populates rp_expenses with valid schema and unique UUIDs', () => {
    seedData();

    const properties = JSON.parse(localStorage.getItem('rp_properties')!);
    const propertyIds = new Set(properties.map((p: { id: string }) => p.id));

    const raw = localStorage.getItem('rp_expenses');
    const expenses = JSON.parse(raw!);

    expect(Array.isArray(expenses)).toBe(true);
    expect(expenses.length).toBeGreaterThan(0);

    const expenseIds = new Set<string>();

    for (const expense of expenses) {
      expect(typeof expense.id).toBe('string');
      expect(expense.id.length).toBeGreaterThan(0);
      expenseIds.add(expense.id);

      expect(propertyIds.has(expense.propertyId)).toBe(true);
      expect(typeof expense.category).toBe('string');
      expect(typeof expense.amount).toBe('number');
      expect(expense.amount).toBeGreaterThan(0);
      expect(expense.date).toMatch(dateFormatRegex);
      expect(typeof expense.description).toBe('string');
      expect(typeof expense.recurring).toBe('boolean');
    }

    expect(expenseIds.size).toBe(expenses.length);
  });

  it('overwrites existing localStorage data when seedData is called again', () => {
    localStorage.setItem('rp_properties', JSON.stringify([{ id: 'stale-prop' }]));
    localStorage.setItem('rp_tenants', JSON.stringify([]));

    seedData();

    const properties = JSON.parse(localStorage.getItem('rp_properties')!);
    expect(properties.find((p: { id: string }) => p.id === 'stale-prop')).toBeUndefined();
    expect(properties.some((p: { id: string }) => p.id === 'prop-001')).toBe(true);
  });
});
