import { describe, it, expect } from "vitest";
import { Note } from "../hooks/useNotes";

function generateNotes(count: number, prefix: string): Note[] {
  const notes: Note[] = [];
  const baseTime = new Date("2025-01-01T00:00:00.000Z").getTime();
  for (let i = 0; i < count; i++) {
    notes.push({
      id: `note-${i}`,
      title: `${prefix} Note ${i}`,
      content: `Content ${i}`,
      tags: ["test"],
      color: "#22c55e",
      createdAt: new Date(baseTime + i * 1000).toISOString(),
      updatedAt: new Date(baseTime + i * 1000).toISOString(),
      deleted: false,
    });
  }
  return notes;
}

// O(N*M) baseline algorithm
export function baselineImportNotesLogic(prev: Note[], incoming: Note[]): Note[] {
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
}

// O(N+M) optimized algorithm
export function optimizedImportNotesLogic(prev: Note[], incoming: Note[]): Note[] {
  const incomingMap = new Map<string, Note>();
  for (let i = 0; i < incoming.length; i++) {
    incomingMap.set(incoming[i].id, incoming[i]);
  }

  const existingIds = new Set<string>();
  const merged = prev.map((existing) => {
    existingIds.add(existing.id);
    const match = incomingMap.get(existing.id);
    if (match && new Date(match.updatedAt) > new Date(existing.updatedAt)) {
      return match;
    }
    return existing;
  });

  const newNotes = incoming.filter((n) => !existingIds.has(n.id));
  return [...merged, ...newNotes];
}

describe("importNotes benchmark and comparison", () => {
  it("compares execution time and output equivalence for 5,000 existing and 7,500 incoming notes", () => {
    const prev1 = generateNotes(5000, "Prev");
    const incoming1 = generateNotes(5000, "Incoming");

    for (let i = 0; i < 2500; i++) {
      incoming1[i].updatedAt = new Date("2025-06-01T00:00:00.000Z").toISOString();
    }
    for (let i = 5000; i < 7500; i++) {
      incoming1.push({
        id: `note-${i}`,
        title: `Incoming Note ${i}`,
        content: `Content ${i}`,
        tags: ["new"],
        color: "#3b82f6",
        createdAt: "2025-05-01T00:00:00.000Z",
        updatedAt: "2025-05-01T00:00:00.000Z",
        deleted: false,
      });
    }

    const prev2 = JSON.parse(JSON.stringify(prev1));
    const incoming2 = JSON.parse(JSON.stringify(incoming1));

    const startBaseline = performance.now();
    const resultBaseline = baselineImportNotesLogic(prev1, incoming1);
    const durationBaseline = performance.now() - startBaseline;

    const startOptimized = performance.now();
    const resultOptimized = optimizedImportNotesLogic(prev2, incoming2);
    const durationOptimized = performance.now() - startOptimized;

    console.log(`[BASELINE O(N*M)]  Duration: ${durationBaseline.toFixed(2)} ms`);
    console.log(`[OPTIMIZED O(N+M)] Duration: ${durationOptimized.toFixed(2)} ms`);
    console.log(`[SPEEDUP]           ${(durationBaseline / durationOptimized).toFixed(2)}x faster`);

    expect(resultOptimized).toEqual(resultBaseline);
  });
});
