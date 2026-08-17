export type ShootType = 'portrait' | 'landscape' | 'event' | 'product' | 'wedding' | 'street' | 'other';

export type ShotPriority = 'must-have' | 'nice-to-have' | 'creative';

export interface PlannedSettings {
  aperture: string;
  shutterSpeed: string;
  iso: string;
  lens: string;
}

export interface ActualSettings {
  aperture: string;
  shutterSpeed: string;
  iso: string;
  lens: string;
  notes: string;
}

export interface Shot {
  id: string;
  description: string;
  priority: ShotPriority;
  planned: PlannedSettings;
  actual?: ActualSettings;
  captured: boolean;
  order: number;
}

export interface GearItem {
  id: string;
  name: string;
  packed: boolean;
}

export interface Shoot {
  id: string;
  client: string;
  date: string; // ISO string
  location: string;
  type: ShootType;
  notes: string;
  shots: Shot[];
  gear: GearItem[];
  createdAt: string;
}
