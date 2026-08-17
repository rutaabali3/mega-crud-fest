export interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

export interface ProgramDay {
  dayIndex: number;
  label: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  daysPerWeek: number;
  createdAt: string;
  days: ProgramDay[];
}

export interface SessionSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  name: string;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  programId: string;
  programName: string;
  dayLabel: string;
  date: string;
  durationMinutes: number;
  exercises: SessionExercise[];
  notes: string;
}

export interface Measurement {
  id: string;
  date: string;
  weight: number;
  unit: "kg" | "lbs";
  bodyFat: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  biceps: number | null;
  thighs: number | null;
  notes: string;
}

export interface AppSettings {
  weightUnit: "kg" | "lbs";
  theme: "dark";
  restTimerSound: boolean;
  defaultRestSeconds: number;
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}
