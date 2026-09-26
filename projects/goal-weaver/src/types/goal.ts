import { z } from "zod";

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

export const progressLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number(),
  note: z.string().optional(),
});

export const goalSchema = z.object({
  id: z.string(),
  title: z.string(),
  unit: z.string(),
  target: z.number(),
  deadline: z.string(),
  createdAt: z.string(),
  isArchived: z.boolean(),
  progressLogs: z.array(progressLogSchema),
});

export const goalArraySchema = z.array(goalSchema);

/** Predefined unit options */
export const UNIT_OPTIONS = ["kg", "USD", "km", "hours", "pages", "custom"] as const;
