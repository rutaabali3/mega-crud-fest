import { useState, useEffect, useCallback } from "react";
import { Decision } from "@/types/decision";
import { SEED_DECISIONS } from "@/data/seedData";

const STORAGE_KEY = "decision_journal_v1";
const DRAFT_KEY = "decision_journal_draft";

function loadDecisions(): Decision[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DECISIONS));
      return SEED_DECISIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

function saveDecisions(decisions: Decision[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
}

export function useDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = loadDecisions();
    setDecisions(data);
    setLoading(false);
  }, []);

  const persist = useCallback((updated: Decision[]) => {
    setDecisions(updated);
    saveDecisions(updated);
  }, []);

  const addDecision = useCallback((decision: Decision) => {
    persist([...decisions, decision]);
  }, [decisions, persist]);

  const updateDecision = useCallback((id: string, updates: Partial<Decision>) => {
    persist(decisions.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [decisions, persist]);

  const trashDecision = useCallback((id: string) => {
    persist(decisions.map(d => d.id === id ? { ...d, isTrashed: true } : d));
  }, [decisions, persist]);

  const restoreDecision = useCallback((id: string) => {
    persist(decisions.map(d => d.id === id ? { ...d, isTrashed: false } : d));
  }, [decisions, persist]);

  const permanentlyDelete = useCallback((id: string) => {
    persist(decisions.filter(d => d.id !== id));
  }, [decisions, persist]);

  const emptyTrash = useCallback(() => {
    persist(decisions.filter(d => !d.isTrashed));
  }, [decisions, persist]);

  const importDecisions = useCallback((imported: Decision[], mode: "merge" | "replace") => {
    if (mode === "replace") {
      persist(imported);
    } else {
      const existingIds = new Set(decisions.map(d => d.id));
      const newOnes = imported.filter(d => !existingIds.has(d.id));
      persist([...decisions, ...newOnes]);
    }
  }, [decisions, persist]);

  const exportDecisions = useCallback(() => {
    const blob = new Blob([JSON.stringify(decisions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decisions_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [decisions]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const activeDecisions = decisions.filter(d => !d.isTrashed);
  const trashedDecisions = decisions.filter(d => d.isTrashed);

  return {
    decisions: activeDecisions,
    trashedDecisions,
    allDecisions: decisions,
    loading,
    addDecision,
    updateDecision,
    trashDecision,
    restoreDecision,
    permanentlyDelete,
    emptyTrash,
    importDecisions,
    exportDecisions,
    clearAll,
  };
}

export function saveDraft(draft: Partial<Decision>) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): Partial<Decision> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
