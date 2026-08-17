export interface VocabEntry {
  id: string;
  word: string;
  translation: string;
  exampleSentence: string;
  targetLanguage: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5;
  nextReviewDate: string;
  lastReviewedDate: string | null;
  timesCorrect: number;
  timesIncorrect: number;
  isMastered: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

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
