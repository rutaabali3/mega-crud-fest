import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Shoot, Shot, GearItem } from '@/types';

const STORAGE_KEY = 'photography-shot-list-shoots';

function loadShoots(): Shoot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface ShootsContextValue {
  shoots: Shoot[];
  addShoot: (shoot: Shoot) => void;
  updateShoot: (id: string, updates: Partial<Shoot>) => void;
  deleteShoot: (id: string) => void;
  getShoot: (id: string) => Shoot | undefined;
  addShot: (shootId: string, shot: Shot) => void;
  updateShot: (shootId: string, shotId: string, updates: Partial<Shot>) => void;
  deleteShot: (shootId: string, shotId: string) => void;
  toggleGearItem: (shootId: string, gearId: string) => void;
  addGearItem: (shootId: string, item: GearItem) => void;
  removeGearItem: (shootId: string, gearId: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
}

const ShootsContext = createContext<ShootsContextValue | undefined>(undefined);

export function ShootsProvider({ children }: { children: React.ReactNode }) {
  const [shoots, setShoots] = useState<Shoot[]>(loadShoots);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shoots));
  }, [shoots]);

  const addShoot = useCallback((shoot: Shoot) => {
    setShoots(prev => [...prev, shoot]);
  }, []);

  const updateShoot = useCallback((id: string, updates: Partial<Shoot>) => {
    setShoots(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteShoot = useCallback((id: string) => {
    setShoots(prev => prev.filter(s => s.id !== id));
  }, []);

  const getShoot = useCallback((id: string) => shoots.find(s => s.id === id), [shoots]);

  const addShot = useCallback((shootId: string, shot: Shot) => {
    setShoots(prev => prev.map(s => (s.id === shootId ? { ...s, shots: [...s.shots, shot] } : s)));
  }, []);

  const updateShot = useCallback((shootId: string, shotId: string, updates: Partial<Shot>) => {
    setShoots(prev =>
      prev.map(s =>
        s.id === shootId
          ? { ...s, shots: s.shots.map(sh => (sh.id === shotId ? { ...sh, ...updates } : sh)) }
          : s,
      ),
    );
  }, []);

  const deleteShot = useCallback((shootId: string, shotId: string) => {
    setShoots(prev => prev.map(s => (s.id === shootId ? { ...s, shots: s.shots.filter(sh => sh.id !== shotId) } : s)));
  }, []);

  const toggleGearItem = useCallback((shootId: string, gearId: string) => {
    setShoots(prev =>
      prev.map(s =>
        s.id === shootId
          ? { ...s, gear: s.gear.map(g => (g.id === gearId ? { ...g, packed: !g.packed } : g)) }
          : s,
      ),
    );
  }, []);

  const addGearItem = useCallback((shootId: string, item: GearItem) => {
    setShoots(prev => prev.map(s => (s.id === shootId ? { ...s, gear: [...s.gear, item] } : s)));
  }, []);

  const removeGearItem = useCallback((shootId: string, gearId: string) => {
    setShoots(prev => prev.map(s => (s.id === shootId ? { ...s, gear: s.gear.filter(g => g.id !== gearId) } : s)));
  }, []);

  const exportData = useCallback(() => JSON.stringify(shoots, null, 2), [shoots]);

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Shoot[];
      setShoots(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({
      shoots,
      addShoot,
      updateShoot,
      deleteShoot,
      getShoot,
      addShot,
      updateShot,
      deleteShot,
      toggleGearItem,
      addGearItem,
      removeGearItem,
      exportData,
      importData,
    }),
    [shoots, addShoot, updateShoot, deleteShoot, getShoot, addShot, updateShot, deleteShot, toggleGearItem, addGearItem, removeGearItem, exportData, importData],
  );

  return <ShootsContext.Provider value={value}>{children}</ShootsContext.Provider>;
}

export function useShoots() {
  const context = useContext(ShootsContext);
  if (!context) {
    throw new Error('useShoots must be used within ShootsProvider');
  }
  return context;
}
