/** A single progress log entry */
export interface ProgressLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
}

/** Goal data model persisted in localStorage */
export interface Goal {
  id: string;
  title: string;
  unit: string;
  target: number;
  deadline: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  isArchived: boolean;
  progressLogs: ProgressLog[];
}

/** Predefined unit options */
export const UNIT_OPTIONS = ["kg", "USD", "km", "hours", "pages", "custom"] as const;
