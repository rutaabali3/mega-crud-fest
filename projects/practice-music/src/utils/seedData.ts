import { format, subDays } from 'date-fns';
import { generateId, getPieces, savePieces, saveSessions, saveSettings, saveGoals } from './storage';
import type { Piece, Session, Settings } from './storage';

const PIECE_COLORS = ['#6C63FF', '#FF6584', '#43E8C8', '#FBBF24', '#38BDF8', '#F472B6'];

export function loadSeedData() {
  // Only seed if no pieces exist
  if (getPieces().length > 0) return;

  const today = new Date();
  const pieces: Piece[] = [
    {
      id: generateId(),
      title: 'Clair de Lune',
      composer: 'Debussy',
      instrument: 'Piano',
      difficulty: 'Advanced',
      targetBPM: 96,
      currentBPM: 72,
      status: 'active',
      dateAdded: format(subDays(today, 21), 'yyyy-MM-dd'),
      dateMastered: null,
      color: PIECE_COLORS[0],
      tags: ['romantic', 'classical'],
    },
    {
      id: generateId(),
      title: 'Bohemian Rhapsody Solo',
      composer: 'Mercury',
      instrument: 'Guitar',
      difficulty: 'Intermediate',
      targetBPM: 120,
      currentBPM: 95,
      status: 'active',
      dateAdded: format(subDays(today, 18), 'yyyy-MM-dd'),
      dateMastered: null,
      color: PIECE_COLORS[1],
      tags: ['rock', 'solo'],
    },
    {
      id: generateId(),
      title: 'The Four Seasons - Spring',
      composer: 'Vivaldi',
      instrument: 'Violin',
      difficulty: 'Expert',
      targetBPM: 144,
      currentBPM: 108,
      status: 'active',
      dateAdded: format(subDays(today, 15), 'yyyy-MM-dd'),
      dateMastered: null,
      color: PIECE_COLORS[2],
      tags: ['baroque', 'classical'],
    },
  ];

  const moods: Array<'1' | '2' | '3' | '4' | '5'> = ['3', '4', '5', '4', '3', '5', '4', '3', '4', '5', '4', '3'];
  const sessions: Session[] = [];
  const daysAgo = [20, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1];

  daysAgo.forEach((d, i) => {
    const piece = pieces[i % 3];
    sessions.push({
      id: generateId(),
      pieceId: piece.id,
      date: format(subDays(today, d), 'yyyy-MM-dd'),
      durationMinutes: 15 + Math.floor(Math.random() * 45),
      bpmReached: Math.floor(piece.currentBPM * (0.8 + Math.random() * 0.25)),
      mood: moods[i],
      notes: ['Worked on dynamics', 'Focused on tricky passage', 'Warm-up + full run', 'Slow practice section B'][i % 4],
      instrument: piece.instrument,
    });
  });

  savePieces(pieces);
  saveSessions(sessions);
  saveGoals([]);
  saveSettings({
    defaultInstrument: 'Piano',
    metronomeBPM: 120,
    metronomeBeatsPerMeasure: 4,
    weeklyGoalMinutes: 120,
    theme: 'dark',
  });
}
