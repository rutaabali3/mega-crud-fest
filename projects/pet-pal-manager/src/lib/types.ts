export type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Fish' | 'Reptile' | 'Other';
export type Sex = 'Male' | 'Female' | 'Unknown';
export type MedFrequency = 'once_daily' | 'twice_daily' | 'every_8h' | 'weekly' | 'as_needed';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  dateOfBirth: string; // ISO
  sex: Sex;
  photoUrl: string;
  emoji: string;
  notes: string;
  archived: boolean;
  createdAt: string;
}

export interface VetVisit {
  id: string;
  petId: string;
  visitDate: string;
  vetName: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  cost: number;
  nextAppointmentDate: string;
  attachmentsNote: string;
  createdAt: string;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  dateGiven: string;
  batchNumber: string;
  vetName: string;
  nextDueDate: string;
  notes: string;
  createdAt: string;
}

export interface HealthRecord {
  vetVisits: VetVisit[];
  vaccinations: Vaccination[];
}

export interface FeedingSchedule {
  id: string;
  petId: string;
  foodType: string;
  amount: number;
  unit: 'g' | 'ml' | 'cups';
  timesPerDay: number;
  specificTimes: string[]; // HH:mm
  notes: string;
  active: boolean;
  createdAt: string;
}

export interface FeedingLog {
  id: string;
  petId: string;
  scheduleId?: string;
  dateTime: string;
  foodType: string;
  amount: number;
  unit: 'g' | 'ml' | 'cups';
  notes: string;
  createdAt: string;
}

export interface FeedingData {
  schedules: FeedingSchedule[];
  logs: FeedingLog[];
}

export interface WeightEntry {
  id: string;
  petId: string;
  weight: number;
  unit: 'kg' | 'lbs' | 'g';
  date: string;
  notes: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: MedFrequency;
  startDate: string;
  endDate: string; // empty = ongoing
  prescribingVet: string;
  purpose: string;
  colorTag: string;
  doses: MedDose[];
  createdAt: string;
}

export interface MedDose {
  id: string;
  timestamp: string;
}

export const SPECIES_EMOJIS: Record<Species, string> = {
  Dog: '🐶',
  Cat: '🐱',
  Bird: '🐦',
  Rabbit: '🐰',
  Fish: '🐟',
  Reptile: '🦎',
  Other: '🐾',
};

export const MED_COLORS = [
  '#4CAF78', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];
