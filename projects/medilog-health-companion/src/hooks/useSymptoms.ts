import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SymptomEntry } from "@/types";
import { generateId } from "@/utils/dateHelpers";
import { useCallback } from "react";

const KEY = "medilog_symptoms";

export function useSymptoms() {
  const [symptoms, setSymptoms] = useLocalStorage<SymptomEntry[]>(KEY, []);

  const addSymptom = useCallback((entry: Omit<SymptomEntry, "id" | "createdAt">) => {
    const newEntry: SymptomEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setSymptoms((prev) => [...prev, newEntry]);
    return newEntry;
  }, [setSymptoms]);

  const updateSymptom = useCallback((id: string, updates: Partial<SymptomEntry>) => {
    setSymptoms((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, [setSymptoms]);

  const deleteSymptom = useCallback((id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
  }, [setSymptoms]);

  return { symptoms, setSymptoms, addSymptom, updateSymptom, deleteSymptom };
}
