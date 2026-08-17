import { useState, useCallback, useEffect } from "react";
import { VocabEntry, AppSettings } from "@/lib/types";
import { getVocab, saveVocab, getSettings, saveSettings, initializeApp } from "@/lib/storage";

export function useVocab() {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());

  useEffect(() => {
    initializeApp();
    setEntries(getVocab());
    setSettingsState(getSettings());
  }, []);

  const refresh = useCallback(() => {
    setEntries(getVocab());
    setSettingsState(getSettings());
  }, []);

  const addEntry = useCallback((entry: Omit<VocabEntry, "id" | "createdAt" | "updatedAt" | "masteryLevel" | "nextReviewDate" | "lastReviewedDate" | "timesCorrect" | "timesIncorrect" | "isMastered">) => {
    const now = new Date().toISOString();
    const newEntry: VocabEntry = {
      ...entry,
      id: crypto.randomUUID(),
      masteryLevel: 0,
      nextReviewDate: now,
      lastReviewedDate: null,
      timesCorrect: 0,
      timesIncorrect: 0,
      isMastered: false,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newEntry, ...getVocab()];
    saveVocab(updated);
    setEntries(updated);
    return newEntry;
  }, []);

  const updateEntry = useCallback((id: string, changes: Partial<VocabEntry>) => {
    const all = getVocab();
    const updated = all.map(e => e.id === id ? { ...e, ...changes, updatedAt: new Date().toISOString() } : e);
    saveVocab(updated);
    setEntries(updated);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    const updated = getVocab().filter(e => e.id !== id);
    saveVocab(updated);
    setEntries(updated);
  }, []);

  const deleteEntries = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    const updated = getVocab().filter(e => !idSet.has(e.id));
    saveVocab(updated);
    setEntries(updated);
  }, []);

  const updateSettings = useCallback((changes: Partial<AppSettings>) => {
    const current = getSettings();
    const updated = { ...current, ...changes };
    saveSettings(updated);
    setSettingsState(updated);
  }, []);

  return { entries, settings, addEntry, updateEntry, deleteEntry, deleteEntries, updateSettings, refresh };
}
