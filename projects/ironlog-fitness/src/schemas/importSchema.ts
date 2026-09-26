import { z } from "zod";

export const ProgramExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  restSeconds: z.number(),
  notes: z.string(),
});

export const ProgramDaySchema = z.object({
  dayIndex: z.number(),
  label: z.string(),
  exercises: z.array(ProgramExerciseSchema),
});

export const ProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  daysPerWeek: z.number(),
  createdAt: z.string(),
  days: z.array(ProgramDaySchema),
});

export const SessionSetSchema = z.object({
  setNumber: z.number(),
  weight: z.number(),
  reps: z.number(),
  completed: z.boolean(),
});

export const SessionExerciseSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  sets: z.array(SessionSetSchema),
});

export const WorkoutSessionSchema = z.object({
  id: z.string(),
  programId: z.string(),
  programName: z.string(),
  dayLabel: z.string(),
  date: z.string(),
  durationMinutes: z.number(),
  exercises: z.array(SessionExerciseSchema),
  notes: z.string(),
});

export const MeasurementSchema = z.object({
  id: z.string(),
  date: z.string(),
  weight: z.number(),
  unit: z.enum(["kg", "lbs"]),
  bodyFat: z.number().nullable(),
  chest: z.number().nullable(),
  waist: z.number().nullable(),
  hips: z.number().nullable(),
  biceps: z.number().nullable(),
  thighs: z.number().nullable(),
  notes: z.string(),
});

export const ImportPayloadSchema = z.object({
  ironlog_programs: z.array(ProgramSchema).optional(),
  ironlog_sessions: z.array(WorkoutSessionSchema).optional(),
  ironlog_measurements: z.array(MeasurementSchema).optional(),
});

export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
