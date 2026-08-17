import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import type { Pet, VetVisit, Vaccination, FeedingSchedule, FeedingLog, WeightEntry, Medication } from '@/lib/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface PetCareContextType {
  pets: Pet[];
  setPets: (v: Pet[] | ((p: Pet[]) => Pet[])) => void;
  vetVisits: VetVisit[];
  setVetVisits: (v: VetVisit[] | ((p: VetVisit[]) => VetVisit[])) => void;
  vaccinations: Vaccination[];
  setVaccinations: (v: Vaccination[] | ((p: Vaccination[]) => Vaccination[])) => void;
  feedingSchedules: FeedingSchedule[];
  setFeedingSchedules: (v: FeedingSchedule[] | ((p: FeedingSchedule[]) => FeedingSchedule[])) => void;
  feedingLogs: FeedingLog[];
  setFeedingLogs: (v: FeedingLog[] | ((p: FeedingLog[]) => FeedingLog[])) => void;
  weights: WeightEntry[];
  setWeights: (v: WeightEntry[] | ((p: WeightEntry[]) => WeightEntry[])) => void;
  medications: Medication[];
  setMedications: (v: Medication[] | ((p: Medication[]) => Medication[])) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const PetCareContext = createContext<PetCareContextType | null>(null);

export function PetCareProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useLocalStorage<Pet[]>('petcare_pets', []);
  const [vetVisits, setVetVisits] = useLocalStorage<VetVisit[]>('petcare_health_visits', []);
  const [vaccinations, setVaccinations] = useLocalStorage<Vaccination[]>('petcare_health_vaccinations', []);
  const [feedingSchedules, setFeedingSchedules] = useLocalStorage<FeedingSchedule[]>('petcare_feedings_schedules', []);
  const [feedingLogs, setFeedingLogs] = useLocalStorage<FeedingLog[]>('petcare_feedings_logs', []);
  const [weights, setWeights] = useLocalStorage<WeightEntry[]>('petcare_weights', []);
  const [medications, setMedications] = useLocalStorage<Medication[]>('petcare_medications', []);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <PetCareContext.Provider value={{
      pets, setPets,
      vetVisits, setVetVisits,
      vaccinations, setVaccinations,
      feedingSchedules, setFeedingSchedules,
      feedingLogs, setFeedingLogs,
      weights, setWeights,
      medications, setMedications,
      searchQuery, setSearchQuery,
    }}>
      {children}
    </PetCareContext.Provider>
  );
}

export function usePetCare() {
  const ctx = useContext(PetCareContext);
  if (!ctx) throw new Error('usePetCare must be used within PetCareProvider');
  return ctx;
}
