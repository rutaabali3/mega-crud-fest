import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "localvibenotes-data";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNote = useCallback((): Note => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      tags: [],
      color: "#22c55e",
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      )
    );
  }, []);

  const softDelete = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, deleted: true, updatedAt: new Date().toISOString() } : n
      )
    );
  }, []);

  const restoreNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, deleted: false, updatedAt: new Date().toISOString() } : n
      )
    );
  }, []);

  const permanentDelete = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const emptyTrash = useCallback(() => {
    setNotes((prev) => prev.filter((n) => !n.deleted));
  }, []);

  const importNotes = useCallback((incoming: Note[]) => {
    setNotes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNotes = incoming.filter((n) => !existingIds.has(n.id));
      const merged = prev.map((existing) => {
        const match = incoming.find((n) => n.id === existing.id);
        if (match && new Date(match.updatedAt) > new Date(existing.updatedAt)) {
          return match;
        }
        return existing;
      });
      return [...merged, ...newNotes];
    });
  }, []);

  const exportNotes = useCallback(() => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `localvibenotes-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const activeNotes = notes.filter((n) => !n.deleted).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const trashedNotes = notes.filter((n) => n.deleted).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    notes,
    activeNotes,
    trashedNotes,
    createNote,
    updateNote,
    softDelete,
    restoreNote,
    permanentDelete,
    emptyTrash,
    importNotes,
    exportNotes,
  };
}
