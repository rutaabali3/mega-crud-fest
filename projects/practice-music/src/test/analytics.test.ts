import { describe, it, expect } from 'vitest';
import type { Piece, Session } from '../utils/storage';

// Original algorithm from AnalyticsView.tsx
function computeBpmDataOriginal(pieces: Piece[], sessions: Session[]) {
  const activePieces = pieces.filter(p => p.status !== 'abandoned').slice(0, 6);
  const allDates = [...new Set(sessions.filter(s => activePieces.some(p => p.id === s.pieceId)).map(s => s.date))].sort();
  return allDates.map(date => {
    const point: Record<string, any> = { date: date };
    activePieces.forEach(p => {
      const s = sessions.find(x => x.pieceId === p.id && x.date === date);
      if (s) point[p.title] = s.bpmReached;
    });
    return point;
  });
}

// Optimized algorithm
export function computeBpmDataOptimized(pieces: Piece[], sessions: Session[]) {
  const activePieces = pieces.filter(p => p.status !== 'abandoned').slice(0, 6);
  const activePieceIds = new Set(activePieces.map(p => p.id));

  const sessionLookup = new Map<string, number>();
  const datesSet = new Set<string>();

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    if (activePieceIds.has(s.pieceId)) {
      const key = `${s.pieceId}_${s.date}`;
      if (!sessionLookup.has(key)) {
        sessionLookup.set(key, s.bpmReached);
      }
      datesSet.add(s.date);
    }
  }

  const allDates = Array.from(datesSet).sort();

  return allDates.map(date => {
    const point: Record<string, any> = { date: date };
    for (let i = 0; i < activePieces.length; i++) {
      const p = activePieces[i];
      const bpm = sessionLookup.get(`${p.id}_${date}`);
      if (bpm !== undefined) {
        point[p.title] = bpm;
      }
    }
    return point;
  });
}

describe('bpmData calculation correctness and benchmark', () => {
  it('produces identical output for sample data', () => {
    const pieces: Piece[] = [
      { id: '1', title: 'Moonlight Sonata', composer: 'Beethoven', instrument: 'Piano', difficulty: 'Intermediate', targetBPM: 140, currentBPM: 110, status: 'active', dateAdded: '2024-01-01', dateMastered: null, color: '#ff0000', tags: [] },
      { id: '2', title: 'Fur Elise', composer: 'Beethoven', instrument: 'Piano', difficulty: 'Beginner', targetBPM: 120, currentBPM: 100, status: 'active', dateAdded: '2024-01-01', dateMastered: null, color: '#00ff00', tags: [] },
      { id: '3', title: 'Abandoned Piece', composer: 'Anon', instrument: 'Piano', difficulty: 'Beginner', targetBPM: 100, currentBPM: 80, status: 'abandoned', dateAdded: '2024-01-01', dateMastered: null, color: '#0000ff', tags: [] },
    ];

    const sessions: Session[] = [
      { id: 's1', pieceId: '1', date: '2024-01-10', durationMinutes: 30, bpmReached: 100, mood: '4', notes: '', instrument: 'Piano' },
      { id: 's2', pieceId: '2', date: '2024-01-10', durationMinutes: 20, bpmReached: 90, mood: '3', notes: '', instrument: 'Piano' },
      { id: 's3', pieceId: '1', date: '2024-01-11', durationMinutes: 40, bpmReached: 105, mood: '5', notes: '', instrument: 'Piano' },
      { id: 's4', pieceId: '1', date: '2024-01-10', durationMinutes: 15, bpmReached: 98, mood: '2', notes: 'duplicate date', instrument: 'Piano' }, // test first-match preservation
    ];

    const originalResult = computeBpmDataOriginal(pieces, sessions);
    const optimizedResult = computeBpmDataOptimized(pieces, sessions);

    expect(optimizedResult).toEqual(originalResult);
  });

  it('benchmark comparison with large dataset', () => {
    const pieces: Piece[] = Array.from({ length: 10 }, (_, i) => ({
      id: `piece_${i}`,
      title: `Piece ${i}`,
      composer: 'Composer',
      instrument: 'Piano',
      difficulty: 'Intermediate',
      targetBPM: 120,
      currentBPM: 100,
      status: i === 9 ? 'abandoned' : 'active',
      dateAdded: '2024-01-01',
      dateMastered: null,
      color: '#000',
      tags: [],
    }));

    const sessions: Session[] = [];
    // Generate 365 days x 10 pieces = 3650 sessions
    for (let day = 1; day <= 365; day++) {
      const date = `2024-${String(Math.floor(day / 31) + 1).padStart(2, '0')}-${String((day % 28) + 1).padStart(2, '0')}`;
      for (let p = 0; p < 10; p++) {
        sessions.push({
          id: `s_${day}_${p}`,
          pieceId: `piece_${p}`,
          date,
          durationMinutes: 30,
          bpmReached: 80 + (day % 40),
          mood: '4',
          notes: '',
          instrument: 'Piano',
        });
      }
    }

    const startOriginal = performance.now();
    for (let i = 0; i < 20; i++) {
      computeBpmDataOriginal(pieces, sessions);
    }
    const durationOriginal = performance.now() - startOriginal;

    const startOptimized = performance.now();
    for (let i = 0; i < 20; i++) {
      computeBpmDataOptimized(pieces, sessions);
    }
    const durationOptimized = performance.now() - startOptimized;

    console.log(`Original (20 iterations): ${durationOriginal.toFixed(2)}ms`);
    console.log(`Optimized (20 iterations): ${durationOptimized.toFixed(2)}ms`);
    console.log(`Speedup: ${(durationOriginal / durationOptimized).toFixed(2)}x`);

    expect(durationOptimized).toBeLessThan(durationOriginal);
  });
});
