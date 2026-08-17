export type FrequencyType = "daily" | "twice_daily" | "three_times" | "weekly" | "as_needed" | "custom";

export type DoseStatus = "taken" | "skipped" | "missed" | "pending";

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: FrequencyType;
  customFrequency?: string;
  scheduleTimes: string[];
  startDate: string;
  endDate?: string;
  prescriber: string;
  color: string;
  notes?: string;
  refillReminderDays: number;
  pillsPerDose: number;
  totalPills?: number;
  isActive: boolean;
  createdAt: string;
};

export type DoseLog = {
  id: string;
  medicationId: string;
  scheduledTime: string;
  takenAt?: string;
  status: DoseStatus;
  notes?: string;
  createdAt: string;
};

export type SymptomEntry = {
  id: string;
  date: string;
  symptom: string;
  severity: 1 | 2 | 3 | 4 | 5;
  linkedMedicationIds: string[];
  notes?: string;
  createdAt: string;
};

export const MEDICATION_COLORS = [
  "#0D9488", "#10B981", "#3B82F6", "#6366F1",
  "#8B5CF6", "#EC4899", "#F43F5E", "#F59E0B",
  "#EF4444", "#14B8A6", "#06B6D4", "#84CC16",
];

export const SYMPTOM_SUGGESTIONS = [
  "Nausea", "Headache", "Dizziness", "Fatigue",
  "Rash", "Stomach pain", "Dry mouth", "Insomnia",
  "Appetite change", "Other",
];

export const SEVERITY_LABELS: Record<number, string> = {
  1: "Mild",
  2: "Noticeable",
  3: "Moderate",
  4: "Severe",
  5: "Debilitating",
};
