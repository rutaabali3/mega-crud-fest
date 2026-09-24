import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarView } from './CalendarView';
import type { Piece, Session } from '../utils/storage';
import { format } from 'date-fns';

describe('CalendarView', () => {
  it('renders correctly and matches sessions with pieces', () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const mockPieces: Piece[] = [
      { id: 'p1', title: 'Sonata No. 1', composer: 'Beethoven', category: 'Classical', targetBpm: 120, currentBpm: 100, status: 'In Progress', color: '#FF0000', notes: '' }
    ];
    const mockSessions: Session[] = [
      { id: 's1', pieceId: 'p1', date: todayStr, durationMinutes: 30, bpmReached: 100, mood: '4', notes: 'Great practice', instrument: 'Piano' }
    ];

    render(<CalendarView sessions={mockSessions} pieces={mockPieces} />);

    // Click on today's date in calendar
    const dayBtn = screen.getByTitle(new RegExp(format(new Date(), 'MMM d')));
    fireEvent.click(dayBtn);

    expect(screen.getByText('Sonata No. 1')).toBeInTheDocument();
  });

  it('benchmark piece lookup performance comparing O(N) find vs O(1) Map lookup', () => {
    const pieceCount = 10000;
    const sessionCount = 5000;

    const mockPieces: Piece[] = Array.from({ length: pieceCount }, (_, i) => ({
      id: `p_${i}`,
      title: `Piece ${i}`,
      composer: `Composer ${i}`,
      category: 'Classical',
      targetBpm: 120,
      currentBpm: 100,
      status: 'In Progress',
      color: '#6C63FF',
      notes: ''
    }));

    const mockSessions: Session[] = Array.from({ length: sessionCount }, (_, i) => ({
      id: `s_${i}`,
      pieceId: `p_${(i * 37) % pieceCount}`,
      date: '2025-01-01',
      durationMinutes: 30,
      bpmReached: 100,
      mood: '4',
      notes: `Note ${i}`,
      instrument: 'Piano'
    }));

    // Baseline: Array.find O(N*M)
    const startFind = performance.now();
    for (let iter = 0; iter < 10; iter++) {
      mockSessions.map(s => mockPieces.find(p => p.id === s.pieceId));
    }
    const endFind = performance.now();
    const timeFind = endFind - startFind;

    // Optimized: Map lookup O(N+M)
    const startMap = performance.now();
    for (let iter = 0; iter < 10; iter++) {
      const pieceMap = new Map(mockPieces.map(p => [p.id, p]));
      mockSessions.map(s => pieceMap.get(s.pieceId));
    }
    const endMap = performance.now();
    const timeMap = endMap - startMap;

    console.log(`[Benchmark] Array.find lookup time (10 iterations x 5000 sessions x 10000 pieces): ${timeFind.toFixed(2)} ms`);
    console.log(`[Benchmark] Map lookup time (10 iterations x 5000 sessions x 10000 pieces): ${timeMap.toFixed(2)} ms`);
    console.log(`[Benchmark] Speedup factor: ${(timeFind / timeMap).toFixed(2)}x faster`);

    expect(timeMap).toBeLessThan(timeFind);
  });
});
