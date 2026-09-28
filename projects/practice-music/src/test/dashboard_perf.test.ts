import { describe, it, expect } from "vitest";
import type { Piece, Session } from "../utils/storage";

function benchmarkArrayFind(pieces: Piece[], recent: Session[]) {
  const start = performance.now();
  const results = recent.map((s) => pieces.find((p) => p.id === s.pieceId));
  const duration = performance.now() - start;
  return { results, duration };
}

function benchmarkMapLookup(pieces: Piece[], recent: Session[]) {
  const start = performance.now();
  const piecesById = new Map<string, Piece>();
  for (const piece of pieces) {
    piecesById.set(piece.id, piece);
  }
  const results = recent.map((s) => piecesById.get(s.pieceId));
  const duration = performance.now() - start;
  return { results, duration };
}

describe("Dashboard Piece Lookup Benchmark", () => {
  it("produces identical lookup results and demonstrates Map performance improvement", () => {
    const numPieces = 2000;
    const numSessions = 2000;

    const pieces: Piece[] = Array.from({ length: numPieces }, (_, i) => ({
      id: `piece-${i}`,
      title: `Piece ${i}`,
      composer: `Composer ${i}`,
      difficulty: "Intermediate",
      targetBPM: 120,
      currentBPM: 100,
      status: "active",
      color: "#6C63FF",
      createdAt: new Date().toISOString(),
    }));

    const sessions: Session[] = Array.from({ length: numSessions }, (_, i) => ({
      id: `session-${i}`,
      pieceId: `piece-${i % numPieces}`,
      date: new Date().toISOString(),
      durationMinutes: 30,
      instrument: "Piano",
      notes: "",
      bpmReached: 100,
      mood: "4",
    }));

    const arrayFindResult = benchmarkArrayFind(pieces, sessions);
    const mapLookupResult = benchmarkMapLookup(pieces, sessions);

    expect(arrayFindResult.results).toEqual(mapLookupResult.results);

    console.log(`Array.find duration: ${arrayFindResult.duration.toFixed(3)} ms`);
    console.log(`Map.get duration: ${mapLookupResult.duration.toFixed(3)} ms`);
    console.log(
      `Speedup: ${(arrayFindResult.duration / mapLookupResult.duration).toFixed(2)}x`
    );
  });
});
