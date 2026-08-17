import { useState, useCallback, useEffect } from 'react';
import { Plant, CareLogEntry, GrowthPhoto } from '@/types/plant';

const STORAGE_KEY = 'plants';

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadPlants(): Plant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistPlants(plants: Plant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>(loadPlants);

  useEffect(() => { persistPlants(plants); }, [plants]);

  const addPlant = useCallback((data: Omit<Plant, 'id' | 'archived' | 'careLog' | 'growthPhotos'>) => {
    const plant: Plant = { ...data, id: generateId(), archived: false, careLog: [], growthPhotos: [] };
    setPlants(prev => [plant, ...prev]);
    return plant;
  }, []);

  const updatePlant = useCallback((id: string, data: Partial<Plant>) => {
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deletePlant = useCallback((id: string) => {
    setPlants(prev => prev.filter(p => p.id !== id));
  }, []);

  const archivePlant = useCallback((id: string) => {
    setPlants(prev => prev.map(p => p.id === id ? { ...p, archived: true, healthStatus: 'rip' as const } : p));
  }, []);

  const restorePlant = useCallback((id: string) => {
    setPlants(prev => prev.map(p => p.id === id ? { ...p, archived: false, healthStatus: 'okay' as const } : p));
  }, []);

  const addCareLog = useCallback((plantId: string, entry: Omit<CareLogEntry, 'id'>) => {
    const logEntry: CareLogEntry = { ...entry, id: generateId() };
    setPlants(prev => prev.map(p => {
      if (p.id !== plantId) return p;
      const updates: Partial<Plant> = { careLog: [logEntry, ...p.careLog] };
      if (entry.type === 'watered') updates.lastWatered = entry.date;
      if (entry.type === 'fertilized') updates.lastFertilized = entry.date;
      if (entry.type === 'repotted') updates.lastRepotted = entry.date;
      return { ...p, ...updates };
    }));
  }, []);

  const deleteCareLog = useCallback((plantId: string, logId: string) => {
    setPlants(prev => prev.map(p =>
      p.id === plantId ? { ...p, careLog: p.careLog.filter(l => l.id !== logId) } : p
    ));
  }, []);

  const addGrowthPhoto = useCallback((plantId: string, photo: Omit<GrowthPhoto, 'id'>) => {
    setPlants(prev => prev.map(p =>
      p.id === plantId ? { ...p, growthPhotos: [...p.growthPhotos, { ...photo, id: generateId() }] } : p
    ));
  }, []);

  const deleteGrowthPhoto = useCallback((plantId: string, photoId: string) => {
    setPlants(prev => prev.map(p =>
      p.id === plantId ? { ...p, growthPhotos: p.growthPhotos.filter(ph => ph.id !== photoId) } : p
    ));
  }, []);

  const importPlants = useCallback((imported: Plant[]) => {
    setPlants(imported);
  }, []);

  const activePlants = plants.filter(p => !p.archived);
  const archivedPlants = plants.filter(p => p.archived);

  return {
    plants, activePlants, archivedPlants,
    addPlant, updatePlant, deletePlant, archivePlant, restorePlant,
    addCareLog, deleteCareLog, addGrowthPhoto, deleteGrowthPhoto,
    importPlants,
  };
}

export function getNextWateringDate(plant: Plant): Date | null {
  if (!plant.lastWatered) return null;
  return new Date(new Date(plant.lastWatered).getTime() + plant.wateringFrequencyDays * 86400000);
}

export function getNextFertilizingDate(plant: Plant): Date | null {
  if (!plant.lastFertilized || !plant.fertilizingFrequencyDays) return null;
  return new Date(new Date(plant.lastFertilized).getTime() + plant.fertilizingFrequencyDays * 86400000);
}

export function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export function isOverdue(plant: Plant): boolean {
  const next = getNextWateringDate(plant);
  if (!next) return false;
  return getDaysUntil(next) < 0;
}

export function needsWaterToday(plant: Plant): boolean {
  const next = getNextWateringDate(plant);
  if (!next) return !plant.lastWatered;
  return getDaysUntil(next) <= 0;
}

export function needsFertilizingToday(plant: Plant): boolean {
  const next = getNextFertilizingDate(plant);
  if (!next) return false;
  return getDaysUntil(next) <= 0;
}

export { generateId };
