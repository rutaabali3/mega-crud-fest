export interface Piece {
  id: string;
  title: string;
  composer: string;
  instrument: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  targetBPM: number;
  currentBPM: number;
  status: 'active' | 'mastered' | 'abandoned';
  dateAdded: string;
  dateMastered: string | null;
  color: string;
  tags: string[];
}

export interface Session {
  id: string;
  pieceId: string;
  date: string;
  durationMinutes: number;
  bpmReached: number;
  mood: '1' | '2' | '3' | '4' | '5';
  notes: string;
  instrument: string;
}

export interface Goal {
  id: string;
  weekStartDate: string;
  targetMinutes: number;
  instrument: string;
  label: string;
}

export interface Settings {
  defaultInstrument: string;
  metronomeBPM: number;
  metronomeBeatsPerMeasure: number;
  weeklyGoalMinutes: number;
  theme: string;
}

const KEYS = {
  pieces: 'mpl_pieces',
  sessions: 'mpl_sessions',
  goals: 'mpl_goals',
  settings: 'mpl_settings',
} as const;

function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const generateId = () => crypto.randomUUID();

export const getPieces = (): Piece[] => getJSON(KEYS.pieces, []);
export const savePieces = (p: Piece[]) => setJSON(KEYS.pieces, p);

export const getSessions = (): Session[] => getJSON(KEYS.sessions, []);
export const saveSessions = (s: Session[]) => setJSON(KEYS.sessions, s);

export const getGoals = (): Goal[] => getJSON(KEYS.goals, []);
export const saveGoals = (g: Goal[]) => setJSON(KEYS.goals, g);

const defaultSettings: Settings = {
  defaultInstrument: 'Piano',
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
  weeklyGoalMinutes: 120,
  theme: 'dark',
};

export const getSettings = (): Settings => getJSON(KEYS.settings, defaultSettings);
export const saveSettings = (s: Settings) => setJSON(KEYS.settings, s);

export function getStorageSize(): number {
  let total = 0;
  for (const key of Object.values(KEYS)) {
    const item = localStorage.getItem(key);
    if (item) total += item.length * 2; // UTF-16
  }
  return total;
}

export function clearAllData() {
  for (const key of Object.values(KEYS)) {
    localStorage.removeItem(key);
  }
}

export function exportAllData() {
  return {
    pieces: getPieces(),
    sessions: getSessions(),
    goals: getGoals(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
}

export function importData(data: { pieces?: Piece[]; sessions?: Session[]; goals?: Goal[]; settings?: Settings }) {
  if (data.pieces) savePieces(data.pieces);
  if (data.sessions) saveSessions(data.sessions);
  if (data.goals) saveGoals(data.goals);
  if (data.settings) saveSettings(data.settings);
}
