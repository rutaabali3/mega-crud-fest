import { createContext, useContext } from "react";
import { VocabEntry, AppSettings } from "./types";

interface VocabContextType {
  entries: VocabEntry[];
  settings: AppSettings;
  addEntry: (entry: Omit<VocabEntry, "id" | "createdAt" | "updatedAt" | "masteryLevel" | "nextReviewDate" | "lastReviewedDate" | "timesCorrect" | "timesIncorrect" | "isMastered">) => VocabEntry;
  updateEntry: (id: string, changes: Partial<VocabEntry>) => void;
  deleteEntry: (id: string) => void;
  deleteEntries: (ids: string[]) => void;
  updateSettings: (changes: Partial<AppSettings>) => void;
  refresh: () => void;
}

export const VocabContext = createContext<VocabContextType | null>(null);

export function useVocabContext() {
  const ctx = useContext(VocabContext);
  if (!ctx) throw new Error("useVocabContext must be used within VocabContext.Provider");
  return ctx;
}
