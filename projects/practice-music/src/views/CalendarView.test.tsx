import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from './CalendarView';
import type { Piece, Session } from '../utils/storage';
import { format } from 'date-fns';

describe('CalendarView', () => {
  it('renders sessions and piece info correctly when a date is selected', () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const pieces: Piece[] = [
      {
        id: 'piece-1',
        title: 'Sonata No. 14',
        composer: 'Beethoven',
        instrument: 'Piano',
        difficulty: 'Advanced',
        targetBPM: 120,
        currentBPM: 100,
        status: 'active',
        dateAdded: '2023-01-01',
        dateMastered: null,
        color: '#FF5733',
        tags: [],
      },
    ];

    const sessions: Session[] = [
      {
        id: 'session-1',
        pieceId: 'piece-1',
        date: todayStr,
        durationMinutes: 30,
        bpmReached: 105,
        mood: '4',
        notes: 'Good practice',
        instrument: 'Piano',
      },
    ];

    render(<CalendarView sessions={sessions} pieces={pieces} />);

    const todayTitleMatch = format(today, 'MMM d');
    const dayButton = screen.getByTitle(new RegExp(todayTitleMatch));
    fireEvent.click(dayButton);

    expect(screen.getByText('Sonata No. 14')).toBeInTheDocument();
    expect(screen.getByText('Piano · Good practice')).toBeInTheDocument();
  });

  it('benchmark piece lookup comparison', () => {
    const numPieces = 5000;
    const numSessions = 1000;

    const pieces: Piece[] = Array.from({ length: numPieces }, (_, i) => ({
      id: `piece-${i}`,
      title: `Piece ${i}`,
      composer: 'Composer',
      instrument: 'Piano',
      difficulty: 'Intermediate',
      targetBPM: 120,
      currentBPM: 100,
      status: 'active',
      dateAdded: '2023-01-01',
      dateMastered: null,
      color: '#6C63FF',
      tags: [],
    }));

    const sessions: Session[] = Array.from({ length: numSessions }, (_, i) => ({
      id: `session-${i}`,
      pieceId: `piece-${(i * 37) % numPieces}`,
      date: '2026-09-01',
      durationMinutes: 20,
      bpmReached: 100,
      mood: '3',
      notes: 'Testing',
      instrument: 'Piano',
    }));

    // Measure linear search lookup (O(N*M))
    const startLinear = performance.now();
    for (let r = 0; r < 100; r++) {
      sessions.map(s => pieces.find(p => p.id === s.pieceId));
    }
    const durationLinear = performance.now() - startLinear;

    // Measure map lookup (O(N + M))
    const startMap = performance.now();
    for (let r = 0; r < 100; r++) {
      const map: Record<string, Piece> = {};
      pieces.forEach(p => { map[p.id] = p; });
      sessions.map(s => map[s.pieceId]);
    }
    const durationMap = performance.now() - startMap;

    console.log(`[Benchmark] 100 iterations with ${numPieces} pieces & ${numSessions} sessions:`);
    console.log(`  - Linear search (pieces.find): ${durationLinear.toFixed(2)} ms`);
    console.log(`  - Map lookup (pieceMap): ${durationMap.toFixed(2)} ms`);
    console.log(`  - Speedup factor: ${(durationLinear / durationMap).toFixed(1)}x faster`);

    expect(durationMap).toBeLessThan(durationLinear);
  });
});
