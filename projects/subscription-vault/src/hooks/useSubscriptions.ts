import { useState, useEffect, useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG } from '@/utils/categoryConfig';
import { toast } from 'sonner';

const STORAGE_KEY = 'subscriptions_vault';

const SEED_DATA: Omit<Subscription, 'id' | 'createdAt' | 'lastEditedAt'>[] = [
  { name: 'Netflix', amount: 15.99, billingCycle: 'monthly', category: 'streaming', renewalDate: new Date(Date.now() + 86400000 * 3).toISOString(), color: CATEGORY_CONFIG.streaming.color, status: 'active', currency: 'USD', logoUrl: '' },
  { name: 'Spotify', amount: 9.99, billingCycle: 'monthly', category: 'streaming', renewalDate: new Date(Date.now() + 86400000 * 7).toISOString(), color: CATEGORY_CONFIG.streaming.color, status: 'active', currency: 'USD', logoUrl: '' },
  { name: 'GitHub Pro', amount: 4, billingCycle: 'monthly', category: 'software', renewalDate: new Date(Date.now() + 86400000 * 12).toISOString(), color: CATEGORY_CONFIG.software.color, status: 'active', currency: 'USD', logoUrl: '' },
  { name: 'ChatGPT Plus', amount: 20, billingCycle: 'monthly', category: 'software', renewalDate: new Date(Date.now() + 86400000 * 5).toISOString(), color: CATEGORY_CONFIG.software.color, status: 'active', currency: 'USD', logoUrl: '' },
  { name: 'PlayStation Plus', amount: 59.99, billingCycle: 'yearly', category: 'gaming', renewalDate: new Date(Date.now() + 86400000 * 45).toISOString(), color: CATEGORY_CONFIG.gaming.color, status: 'active', currency: 'USD', logoUrl: '' },
  { name: 'iCloud 200GB', amount: 2.99, billingCycle: 'monthly', category: 'utilities', renewalDate: new Date(Date.now() + 86400000 * 1).toISOString(), color: CATEGORY_CONFIG.utilities.color, status: 'active', currency: 'USD', logoUrl: '' },
];

function loadFromStorage(): { subscriptions: Subscription[]; isFirstLoad: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { subscriptions: JSON.parse(raw), isFirstLoad: false };
  } catch {}
  // Seed data
  const now = new Date().toISOString();
  const seeded = SEED_DATA.map(s => ({
    ...s,
    id: crypto.randomUUID(),
    createdAt: now,
    lastEditedAt: now,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return { subscriptions: seeded, isFirstLoad: true };
}

export function useSubscriptions() {
  const [data, setData] = useState<{ subscriptions: Subscription[]; isFirstLoad: boolean }>(() => loadFromStorage());
  const subscriptions = data.subscriptions;
  const isFirstLoad = data.isFirstLoad;

  const persist = useCallback((subs: Subscription[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  }, []);

  const addSubscription = useCallback((sub: Omit<Subscription, 'id' | 'createdAt' | 'lastEditedAt' | 'color'>) => {
    const now = new Date().toISOString();
    const newSub: Subscription = {
      ...sub,
      id: crypto.randomUUID(),
      color: CATEGORY_CONFIG[sub.category].color,
      createdAt: now,
      lastEditedAt: now,
    };
    setData(prev => {
      const next = [...prev.subscriptions, newSub];
      persist(next);
      return { subscriptions: next, isFirstLoad: false };
    });
    toast.success(`${sub.name} added successfully`);
    return newSub;
  }, [persist]);

  const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    setData(prev => {
      const next = prev.subscriptions.map(s =>
        s.id === id ? { ...s, ...updates, lastEditedAt: new Date().toISOString(), color: updates.category ? CATEGORY_CONFIG[updates.category].color : s.color } : s
      );
      persist(next);
      return { ...prev, subscriptions: next };
    });
    toast.success('Subscription updated');
  }, [persist]);

  const deleteSubscription = useCallback((id: string) => {
    setData(prev => {
      const sub = prev.subscriptions.find(s => s.id === id);
      const next = prev.subscriptions.filter(s => s.id !== id);
      persist(next);
      if (sub) toast.error(`${sub.name} deleted`);
      return { ...prev, subscriptions: next };
    });
  }, [persist]);

  const toggleStatus = useCallback((id: string) => {
    setData(prev => {
      const next = prev.subscriptions.map(s =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const, lastEditedAt: new Date().toISOString() } : s
      );
      persist(next);
      const sub = next.find(s => s.id === id);
      if (sub) toast(sub.status === 'active' ? `${sub.name} resumed` : `${sub.name} paused`, { className: 'bg-amber-500/20' });
      return { ...prev, subscriptions: next };
    });
  }, [persist]);

  const dismissFirstLoad = useCallback(() => {
    setData(prev => ({ ...prev, isFirstLoad: false }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(subscriptions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions_vault.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  }, [subscriptions]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported: Subscription[] = JSON.parse(e.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('Invalid');
        setData(prev => {
          const existingIds = new Set(prev.subscriptions.map(s => s.id));
          const newSubs = imported.filter(s => !existingIds.has(s.id));
          const merged = [...prev.subscriptions, ...newSubs];
          persist(merged);
          toast.success(`Imported ${newSubs.length} new subscriptions`);
          return { ...prev, subscriptions: merged };
        });
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  }, [persist]);

  return { subscriptions, isFirstLoad, addSubscription, updateSubscription, deleteSubscription, toggleStatus, dismissFirstLoad, exportData, importData };
}
