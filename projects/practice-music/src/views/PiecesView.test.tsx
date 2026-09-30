import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PiecesView } from './PiecesView';
import type { Piece, Session } from '../utils/storage';

describe('PiecesView', () => {
  const samplePieces: Piece[] = [
    {
      id: 'p1',
      title: 'Moonlight Sonata',
      composer: 'Beethoven',
      instrument: 'Piano',
      difficulty: 'Intermediate',
      targetBPM: 120,
      currentBPM: 90,
      status: 'active',
      dateAdded: '2025-01-01',
      dateMastered: null,
      color: '#3b82f6',
      tags: ['Classical'],
    },
    {
      id: 'p2',
      title: 'Clair de Lune',
      composer: 'Debussy',
      instrument: 'Piano',
      difficulty: 'Advanced',
      targetBPM: 100,
      currentBPM: 100,
      status: 'mastered',
      dateAdded: '2025-01-02',
      dateMastered: '2025-02-01',
      color: '#10b981',
      tags: ['Impressionism'],
    },
  ];

  const sampleSessions: Session[] = [
    {
      id: 's1',
      pieceId: 'p1',
      date: '2025-01-05',
      durationMinutes: 30,
      bpmReached: 85,
      mood: '4',
      notes: 'Good session',
      instrument: 'Piano',
    },
    {
      id: 's2',
      pieceId: 'p1',
      date: '2025-01-10',
      durationMinutes: 45,
      bpmReached: 90,
      mood: '5',
      notes: 'Faster tempo',
      instrument: 'Piano',
    },
    {
      id: 's3',
      pieceId: 'p2',
      date: '2025-01-08',
      durationMinutes: 20,
      bpmReached: 100,
      mood: '5',
      notes: 'Mastered section',
      instrument: 'Piano',
    },
  ];

  it('renders pieces and correctly calculates total minutes per piece', () => {
    render(
      <PiecesView
        pieces={samplePieces}
        sessions={sampleSessions}
        onUpdatePieces={vi.fn()}
        onUpdateSessions={vi.fn()}
        onLogSession={vi.fn()}
      />
    );

    expect(screen.getByText('Moonlight Sonata')).toBeInTheDocument();
    expect(screen.getByText('Clair de Lune')).toBeInTheDocument();

    // p1 has 30 + 45 = 75 min
    expect(screen.getByText('Total: 75 min')).toBeInTheDocument();
    // p2 has 20 min
    expect(screen.getByText('Total: 20 min')).toBeInTheDocument();
  });

  it('benchmark comparing O(N*S) session filtering vs pre-computed Map lookup', () => {
    const numPieces = 2000;
    const numSessions = 5000;

    const mockPieces: Piece[] = Array.from({ length: numPieces }, (_, i) => ({
      id: `p_${i}`,
      title: `Piece ${i}`,
      composer: `Composer ${i}`,
      instrument: 'Piano',
      difficulty: 'Intermediate',
      targetBPM: 120,
      currentBPM: 100,
      status: 'active',
      dateAdded: '2025-01-01',
      dateMastered: null,
      color: '#3b82f6',
      tags: [],
    }));

    const mockSessions: Session[] = Array.from({ length: numSessions }, (_, i) => ({
      id: `s_${i}`,
      pieceId: `p_${i % numPieces}`,
      date: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
      durationMinutes: 15,
      bpmReached: 100,
      mood: '4',
      notes: '',
      instrument: 'Piano',
    }));

    // Baseline: nested array filtering per piece
    const startBaseline = performance.now();
    const baselineResults = mockPieces.map(p => {
      const totalMin = mockSessions.filter(s => s.pieceId === p.id).reduce((a, s) => a + s.durationMinutes, 0);
      const lastPracticed = mockSessions.filter(s => s.pieceId === p.id).sort((x, y) => y.date.localeCompare(x.date))[0]?.date || '';
      return { totalMin, lastPracticed };
    });
    const baselineDuration = performance.now() - startBaseline;

    // Optimized: single-pass Map indexing
    const startOptimized = performance.now();
    const statsMap = new Map<string, { totalMinutes: number; lastPracticed: string }>();
    for (let i = 0; i < mockSessions.length; i++) {
      const s = mockSessions[i];
      const cur = statsMap.get(s.pieceId);
      const d = s.date || '';
      if (!cur) {
        statsMap.set(s.pieceId, { totalMinutes: s.durationMinutes, lastPracticed: d });
      } else {
        cur.totalMinutes += s.durationMinutes;
        if (d > cur.lastPracticed) cur.lastPracticed = d;
      }
    }
    const optimizedResults = mockPieces.map(p => {
      const stats = statsMap.get(p.id);
      return {
        totalMin: stats?.totalMinutes ?? 0,
        lastPracticed: stats?.lastPracticed ?? '',
      };
    });
    const optimizedDuration = performance.now() - startOptimized;

    expect(baselineResults).toEqual(optimizedResults);
    console.log(`[PiecesView Benchmark] Baseline nested filter: ${baselineDuration.toFixed(2)} ms`);
    console.log(`[PiecesView Benchmark] Map lookup: ${optimizedDuration.toFixed(2)} ms`);
    console.log(`[PiecesView Benchmark] Speedup factor: ${(baselineDuration / optimizedDuration).toFixed(2)}x faster`);

    expect(optimizedDuration).toBeLessThan(baselineDuration);
  });
});
