import { z } from "zod";

export const vocabEntrySchema = z.object({
  id: z.string(),
  word: z.string(),
  translation: z.string(),
  exampleSentence: z.string(),
  targetLanguage: z.string(),
  tags: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  masteryLevel: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  nextReviewDate: z.string(),
  lastReviewedDate: z.string().nullable(),
  timesCorrect: z.number().int().min(0),
  timesIncorrect: z.number().int().min(0),
  isMastered: z.boolean(),
  source: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const vocabEntriesSchema = z.array(vocabEntrySchema);

export type VocabEntry = z.infer<typeof vocabEntrySchema>;

export interface AppSettings {
  streakCount: number;
  lastQuizDate: string | null;
  totalQuizzesTaken: number;
  highScore: number;
  preferredLanguage: string;
  darkMode: boolean;
  dailyGoal: number;
}

export interface ActivityLog {
  [date: string]: number; // ISO date string -> count of words reviewed
}

export type QuizMode = "flashcard" | "multiple-choice" | "type-answer";
export type SortOption = "newest" | "alphabetical" | "mastery" | "nextReview";
export type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";
