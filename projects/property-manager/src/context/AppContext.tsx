import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { seedData } from '@/lib/seedData';

// Types
export interface Property {
  id: string;
  address: string;
  unit: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  purchasePrice: number;
  monthlyMortgage: number;
  photoUrl: string;
  status: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  depositHeld: number;
  depositReturned: boolean;
  notes: string;
  status: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  type: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
  notes: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  cost: number;
  contractorName: string;
  contractorPhone: string;
  reportedDate: string;
  resolvedDate: string | null;
}

export interface Expense {
  id: string;
  propertyId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  recurring: boolean;
}

interface AppContextType {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  maintenance: MaintenanceRequest[];
  expenses: Expense[];
  addProperty: (data: Omit<Property, 'id'>) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  archiveProperty: (id: string) => void;
  unarchiveProperty: (id: string) => void;
  addTenant: (data: Omit<Tenant, 'id'>) => void;
  updateTenant: (id: string, data: Partial<Tenant>) => void;
  archiveTenant: (id: string, depositReturned: boolean) => void;
  addPayment: (data: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  markPaid: (id: string, paidDate: string, amount: number) => void;
  
  addMaintenance: (data: Omit<MaintenanceRequest, 'id'>) => void;
  updateMaintenance: (id: string, data: Partial<MaintenanceRequest>) => void;
  deleteMaintenance: (id: string) => void;
  updateMaintenanceStatus: (id: string, newStatus: string) => void;
  addExpense: (data: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  clearAllData: () => void;
  exportData: () => void;
  importData: (jsonString: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function readLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (localStorage.getItem('rp_properties') === null) {
      seedData();
    }
    setProperties(readLS('rp_properties'));
    setTenants(readLS('rp_tenants'));
    setPayments(readLS('rp_payments'));
    setMaintenance(readLS('rp_maintenance'));
    setExpenses(readLS('rp_expenses'));
  }, []);

  // PROPERTIES
  const addProperty = useCallback((data: Omit<Property, 'id'>) => {
    const current = readLS<Property>('rp_properties');
    const newItem = { ...data, id: crypto.randomUUID() } as Property;
    const updated = [...current, newItem];
    writeLS('rp_properties', updated);
    setProperties(updated);
    toast.success('Property added');
  }, []);

  const updateProperty = useCallback((id: string, data: Partial<Property>) => {
    const current = readLS<Property>('rp_properties');
    const updated = current.map(p => p.id === id ? { ...p, ...data } : p);
    writeLS('rp_properties', updated);
    setProperties(updated);
    toast.success('Property updated');
  }, []);

  const archiveProperty = useCallback((id: string) => {
    const current = readLS<Property>('rp_properties');
    const updated = current.map(p => p.id === id ? { ...p, status: 'archived' } : p);
    writeLS('rp_properties', updated);
    setProperties(updated);
    toast.success('Property archived');
  }, []);

  const unarchiveProperty = useCallback((id: string) => {
    const current = readLS<Property>('rp_properties');
    const updated = current.map(p => p.id === id ? { ...p, status: 'vacant' } : p);
    writeLS('rp_properties', updated);
    setProperties(updated);
    toast.success('Property unarchived');
  }, []);

  // TENANTS
  const addTenant = useCallback((data: Omit<Tenant, 'id'>) => {
    const current = readLS<Tenant>('rp_tenants');
    const newItem = { ...data, id: crypto.randomUUID() } as Tenant;
    const updated = [...current, newItem];
    writeLS('rp_tenants', updated);
    setTenants(updated);
    // Update property status
    const props = readLS<Property>('rp_properties');
    const updatedProps = props.map(p => p.id === data.propertyId ? { ...p, status: 'occupied' } : p);
    writeLS('rp_properties', updatedProps);
    setProperties(updatedProps);
    toast.success('Tenant added');
  }, []);

  const updateTenant = useCallback((id: string, data: Partial<Tenant>) => {
    const current = readLS<Tenant>('rp_tenants');
    const updated = current.map(t => t.id === id ? { ...t, ...data } : t);
    writeLS('rp_tenants', updated);
    setTenants(updated);
    toast.success('Tenant updated');
  }, []);

  const archiveTenant = useCallback((id: string, depositReturned: boolean) => {
    const current = readLS<Tenant>('rp_tenants');
    const tenant = current.find(t => t.id === id);
    if (!tenant) return;
    const updated = current.map(t => t.id === id ? { ...t, status: 'archived', depositReturned } : t);
    writeLS('rp_tenants', updated);
    setTenants(updated);
    // Set property to vacant
    const props = readLS<Property>('rp_properties');
    const updatedProps = props.map(p => p.id === tenant.propertyId ? { ...p, status: 'vacant' } : p);
    writeLS('rp_properties', updatedProps);
    setProperties(updatedProps);
    toast.success('Tenancy archived');
  }, []);

  // PAYMENTS
  const addPayment = useCallback((data: Omit<Payment, 'id'>) => {
    const current = readLS<Payment>('rp_payments');
    const newItem = { ...data, id: crypto.randomUUID() } as Payment;
    const updated = [...current, newItem];
    writeLS('rp_payments', updated);
    setPayments(updated);
    toast.success('Payment logged');
  }, []);

  const updatePayment = useCallback((id: string, data: Partial<Payment>) => {
    const current = readLS<Payment>('rp_payments');
    const updated = current.map(p => p.id === id ? { ...p, ...data } : p);
    writeLS('rp_payments', updated);
    setPayments(updated);
    toast.success('Payment updated');
  }, []);

  const deletePayment = useCallback((id: string) => {
    const current = readLS<Payment>('rp_payments');
    const updated = current.filter(p => p.id !== id);
    writeLS('rp_payments', updated);
    setPayments(updated);
    toast.success('Payment deleted');
  }, []);

  const markPaid = useCallback((id: string, paidDate: string, amount: number) => {
    const current = readLS<Payment>('rp_payments');
    const updated = current.map(p => p.id === id ? { ...p, status: 'paid', paidDate, amount } : p);
    writeLS('rp_payments', updated);
    setPayments(updated);
    toast.success('Payment marked as paid');
  }, []);


  // MAINTENANCE
  const addMaintenance = useCallback((data: Omit<MaintenanceRequest, 'id'>) => {
    const current = readLS<MaintenanceRequest>('rp_maintenance');
    const newItem = { ...data, id: crypto.randomUUID() } as MaintenanceRequest;
    const updated = [...current, newItem];
    writeLS('rp_maintenance', updated);
    setMaintenance(updated);
    toast.success('Request created');
  }, []);

  const updateMaintenance = useCallback((id: string, data: Partial<MaintenanceRequest>) => {
    const current = readLS<MaintenanceRequest>('rp_maintenance');
    const updated = current.map(m => m.id === id ? { ...m, ...data } : m);
    writeLS('rp_maintenance', updated);
    setMaintenance(updated);
    toast.success('Request updated');
  }, []);

  const deleteMaintenance = useCallback((id: string) => {
    const current = readLS<MaintenanceRequest>('rp_maintenance');
    const updated = current.filter(m => m.id !== id);
    writeLS('rp_maintenance', updated);
    setMaintenance(updated);
    toast.success('Request deleted');
  }, []);

  const updateMaintenanceStatus = useCallback((id: string, newStatus: string) => {
    const current = readLS<MaintenanceRequest>('rp_maintenance');
    const updated = current.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        status: newStatus,
        resolvedDate: newStatus === 'resolved' ? new Date().toISOString().slice(0, 10) : m.resolvedDate,
      };
    });
    writeLS('rp_maintenance', updated);
    setMaintenance(updated);
    toast.success('Status updated');
  }, []);

  // EXPENSES
  const addExpense = useCallback((data: Omit<Expense, 'id'>) => {
    const current = readLS<Expense>('rp_expenses');
    const newItem = { ...data, id: crypto.randomUUID() } as Expense;
    const updated = [...current, newItem];
    writeLS('rp_expenses', updated);
    setExpenses(updated);
    toast.success('Expense logged');
  }, []);

  const updateExpense = useCallback((id: string, data: Partial<Expense>) => {
    const current = readLS<Expense>('rp_expenses');
    const updated = current.map(e => e.id === id ? { ...e, ...data } : e);
    writeLS('rp_expenses', updated);
    setExpenses(updated);
    toast.success('Expense updated');
  }, []);

  const deleteExpense = useCallback((id: string) => {
    const current = readLS<Expense>('rp_expenses');
    const updated = current.filter(e => e.id !== id);
    writeLS('rp_expenses', updated);
    setExpenses(updated);
    toast.success('Expense deleted');
  }, []);

  // GLOBAL
  const clearAllData = useCallback(() => {
    ['rp_properties', 'rp_tenants', 'rp_payments', 'rp_maintenance', 'rp_expenses'].forEach(k => localStorage.removeItem(k));
    setProperties([]);
    setTenants([]);
    setPayments([]);
    setMaintenance([]);
    setExpenses([]);
    toast.success('All data cleared');
  }, []);

  const exportData = useCallback(() => {
    const data = {
      properties: readLS('rp_properties'),
      tenants: readLS('rp_tenants'),
      payments: readLS('rp_payments'),
      maintenance: readLS('rp_maintenance'),
      expenses: readLS('rp_expenses'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rp_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Data exported');
  }, []);

  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.properties || !data.tenants || !data.payments || !data.maintenance || !data.expenses) {
        toast.error('Invalid backup file format');
        return;
      }
      writeLS('rp_properties', data.properties);
      writeLS('rp_tenants', data.tenants);
      writeLS('rp_payments', data.payments);
      writeLS('rp_maintenance', data.maintenance);
      writeLS('rp_expenses', data.expenses);
      setProperties(data.properties);
      setTenants(data.tenants);
      setPayments(data.payments);
      setMaintenance(data.maintenance);
      setExpenses(data.expenses);
      toast.success('Data imported successfully');
    } catch {
      toast.error('Failed to parse import file');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      properties, tenants, payments, maintenance, expenses,
      addProperty, updateProperty, archiveProperty, unarchiveProperty,
      addTenant, updateTenant, archiveTenant,
      addPayment, updatePayment, deletePayment, markPaid,
      addMaintenance, updateMaintenance, deleteMaintenance, updateMaintenanceStatus,
      addExpense, updateExpense, deleteExpense,
      clearAllData, exportData, importData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
