export type HealthStatus = 'thriving' | 'okay' | 'struggling' | 'rip';

export interface CareLogEntry {
  id: string;
  type: 'watered' | 'fertilized' | 'repotted' | 'note';
  date: string;
  note: string;
}

export interface GrowthPhoto {
  id: string;
  url: string;
  date: string;
  caption: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  photoUrl: string;
  location: string;
  soilType: string;
  purchaseDate: string;
  healthStatus: HealthStatus;
  wateringFrequencyDays: number;
  fertilizingFrequencyDays: number;
  lastWatered: string | null;
  lastFertilized: string | null;
  lastRepotted: string | null;
  notes: string;
  archived: boolean;
  careLog: CareLogEntry[];
  growthPhotos: GrowthPhoto[];
}

export const LOCATIONS = [
  'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony', 'Garden', 'Office', 'Other'
];

export const SOIL_TYPES = [
  'Well-draining', 'Loamy', 'Sandy', 'Clay', 'Peat-based', 'Succulent mix', 'Other'
];

export const HEALTH_EMOJIS: Record<HealthStatus, string> = {
  thriving: '🟢',
  okay: '🟡',
  struggling: '🔴',
  rip: '⚫',
};
