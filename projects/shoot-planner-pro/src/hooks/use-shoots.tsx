// Shoots context provider and hook
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
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

function saveShoots(shoots: Shoot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shoots));
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

const ShootsContext = createContext<ShootsContextValue | null>(null);

// Fallback shared store to prevent hard crashes if context is temporarily unavailable (e.g. HMR edge cases)
let fallbackShootsState: Shoot[] = loadShoots();
const fallbackListeners = new Set<() => void>();

const subscribeFallback = (listener: () => void) => {
  fallbackListeners.add(listener);
  return () => fallbackListeners.delete(listener);
};

const getFallbackSnapshot = () => fallbackShootsState;

const setFallbackShootsState = (updater: (prev: Shoot[]) => Shoot[]) => {
  fallbackShootsState = updater(fallbackShootsState);
  saveShoots(fallbackShootsState);
  fallbackListeners.forEach(listener => listener());
};

const fallbackActions = {
  addShoot: (shoot: Shoot) => setFallbackShootsState(prev => [...prev, shoot]),
  updateShoot: (id: string, updates: Partial<Shoot>) =>
    setFallbackShootsState(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s))),
  deleteShoot: (id: string) => setFallbackShootsState(prev => prev.filter(s => s.id !== id)),
  addShot: (shootId: string, shot: Shot) =>
    setFallbackShootsState(prev => prev.map(s => (s.id === shootId ? { ...s, shots: [...s.shots, shot] } : s))),
  updateShot: (shootId: string, shotId: string, updates: Partial<Shot>) =>
    setFallbackShootsState(prev =>
      prev.map(s =>
        s.id === shootId
          ? { ...s, shots: s.shots.map(sh => (sh.id === shotId ? { ...sh, ...updates } : sh)) }
          : s,
      ),
    ),
  deleteShot: (shootId: string, shotId: string) =>
    setFallbackShootsState(prev =>
      prev.map(s => (s.id === shootId ? { ...s, shots: s.shots.filter(sh => sh.id !== shotId) } : s)),
    ),
  toggleGearItem: (shootId: string, gearId: string) =>
    setFallbackShootsState(prev =>
      prev.map(s =>
        s.id === shootId
          ? { ...s, gear: s.gear.map(g => (g.id === gearId ? { ...g, packed: !g.packed } : g)) }
          : s,
      ),
    ),
  addGearItem: (shootId: string, item: GearItem) =>
    setFallbackShootsState(prev => prev.map(s => (s.id === shootId ? { ...s, gear: [...s.gear, item] } : s))),
  removeGearItem: (shootId: string, gearId: string) =>
    setFallbackShootsState(prev =>
      prev.map(s => (s.id === shootId ? { ...s, gear: s.gear.filter(g => g.id !== gearId) } : s)),
    ),
  importData: (json: string) => {
    try {
      const data = JSON.parse(json) as Shoot[];
      setFallbackShootsState(() => data);
      return true;
    } catch {
      return false;
    }
  },
};

export function ShootsProvider({ children }: { children: React.ReactNode }) {
  const [shoots, setShoots] = useState<Shoot[]>(loadShoots);

  useEffect(() => {
    saveShoots(shoots);
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
    setShoots(prev =>
      prev.map(s => (s.id === shootId ? { ...s, shots: s.shots.filter(sh => sh.id !== shotId) } : s)),
    );
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
    setShoots(prev =>
      prev.map(s => (s.id === shootId ? { ...s, gear: s.gear.filter(g => g.id !== gearId) } : s)),
    );
  }, []);

  const exportData = useCallback(() => JSON.stringify(shoots, null, 2), [shoots]);

  const importData = useCallback((json: string) => {
    try {
      const data = JSON.parse(json) as Shoot[];
      setShoots(data);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <ShootsContext.Provider
      value={{
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
      }}
    >
      {children}
    </ShootsContext.Provider>
  );
}

export function useShoots() {
  const ctx = useContext(ShootsContext);
  const fallbackShoots = useSyncExternalStore(subscribeFallback, getFallbackSnapshot, getFallbackSnapshot);

  const fallbackValue = useMemo<ShootsContextValue>(
    () => ({
      shoots: fallbackShoots,
      addShoot: fallbackActions.addShoot,
      updateShoot: fallbackActions.updateShoot,
      deleteShoot: fallbackActions.deleteShoot,
      getShoot: (id: string) => fallbackShoots.find(s => s.id === id),
      addShot: fallbackActions.addShot,
      updateShot: fallbackActions.updateShot,
      deleteShot: fallbackActions.deleteShot,
      toggleGearItem: fallbackActions.toggleGearItem,
      addGearItem: fallbackActions.addGearItem,
      removeGearItem: fallbackActions.removeGearItem,
      exportData: () => JSON.stringify(fallbackShoots, null, 2),
      importData: fallbackActions.importData,
    }),
    [fallbackShoots],
  );

  return ctx ?? fallbackValue;
}
