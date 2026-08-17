import { VocabEntry, AppSettings, ActivityLog } from "./types";

const VOCAB_KEY = "vocab_bank_v1";
const SETTINGS_KEY = "vocab_settings_v1";
const ACTIVITY_KEY = "vocab_activity_v1";

export function getVocab(): VocabEntry[] {
  const raw = localStorage.getItem(VOCAB_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveVocab(entries: VocabEntry[]) {
  localStorage.setItem(VOCAB_KEY, JSON.stringify(entries));
}

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  return defaultSettings();
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getActivity(): ActivityLog {
  const raw = localStorage.getItem(ACTIVITY_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  return {};
}

export function logActivity(date?: string) {
  const activity = getActivity();
  const key = date || new Date().toISOString().split("T")[0];
  activity[key] = (activity[key] || 0) + 1;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}

export function clearAllData() {
  localStorage.removeItem(VOCAB_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
}

function defaultSettings(): AppSettings {
  return {
    streakCount: 3,
    lastQuizDate: null,
    totalQuizzesTaken: 0,
    highScore: 0,
    preferredLanguage: "Spanish",
    darkMode: false,
    dailyGoal: 10,
  };
}

function daysFromNow(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString();
}

function daysAgo(d: number): string {
  return daysFromNow(-d);
}

export function seedData() {
  const entries: VocabEntry[] = [
    {
      id: crypto.randomUUID(), word: "hola", translation: "hello",
      exampleSentence: "¡Hola! ¿Cómo estás?", targetLanguage: "Spanish",
      tags: ["greetings", "basics"], difficulty: "beginner", masteryLevel: 4,
      nextReviewDate: daysFromNow(14), lastReviewedDate: daysAgo(1),
      timesCorrect: 8, timesIncorrect: 1, isMastered: false, source: "Duolingo",
      createdAt: daysAgo(30), updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(), word: "mariposa", translation: "butterfly",
      exampleSentence: "La mariposa es muy bonita.", targetLanguage: "Spanish",
      tags: ["nature", "animals"], difficulty: "intermediate", masteryLevel: 2,
      nextReviewDate: daysFromNow(0), lastReviewedDate: daysAgo(3),
      timesCorrect: 3, timesIncorrect: 2, isMastered: false, source: "Book: Don Quixote",
      createdAt: daysAgo(20), updatedAt: daysAgo(3),
    },
    {
      id: crypto.randomUUID(), word: "desarrollar", translation: "to develop",
      exampleSentence: "Necesitamos desarrollar una nueva estrategia.", targetLanguage: "Spanish",
      tags: ["verbs", "business"], difficulty: "advanced", masteryLevel: 1,
      nextReviewDate: daysAgo(1), lastReviewedDate: daysAgo(4),
      timesCorrect: 1, timesIncorrect: 3, isMastered: false, source: "News article",
      createdAt: daysAgo(15), updatedAt: daysAgo(4),
    },
    {
      id: crypto.randomUUID(), word: "comida", translation: "food",
      exampleSentence: "La comida mexicana es deliciosa.", targetLanguage: "Spanish",
      tags: ["food", "basics"], difficulty: "beginner", masteryLevel: 5,
      nextReviewDate: daysFromNow(30), lastReviewedDate: daysAgo(2),
      timesCorrect: 12, timesIncorrect: 0, isMastered: true, source: "Duolingo",
      createdAt: daysAgo(60), updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(), word: "biblioteca", translation: "library",
      exampleSentence: "Voy a la biblioteca todos los días.", targetLanguage: "Spanish",
      tags: ["places", "education"], difficulty: "intermediate", masteryLevel: 3,
      nextReviewDate: daysFromNow(2), lastReviewedDate: daysAgo(3),
      timesCorrect: 5, timesIncorrect: 1, isMastered: false, source: "Textbook",
      createdAt: daysAgo(25), updatedAt: daysAgo(3),
    },
    {
      id: crypto.randomUUID(), word: "felicidad", translation: "happiness",
      exampleSentence: "La felicidad está en las pequeñas cosas.", targetLanguage: "Spanish",
      tags: ["emotions", "abstract"], difficulty: "intermediate", masteryLevel: 1,
      nextReviewDate: daysAgo(2), lastReviewedDate: daysAgo(6),
      timesCorrect: 2, timesIncorrect: 3, isMastered: false, source: "Movie: Coco",
      createdAt: daysAgo(12), updatedAt: daysAgo(6),
    },
    {
      id: crypto.randomUUID(), word: "ありがとう", translation: "thank you",
      exampleSentence: "助けてくれてありがとう。", targetLanguage: "Japanese",
      tags: ["greetings", "basics", "polite"], difficulty: "beginner", masteryLevel: 3,
      nextReviewDate: daysFromNow(1), lastReviewedDate: daysAgo(2),
      timesCorrect: 5, timesIncorrect: 2, isMastered: false, source: "Anime",
      createdAt: daysAgo(25), updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(), word: "図書館", translation: "library",
      exampleSentence: "図書館で本を借りました。", targetLanguage: "Japanese",
      tags: ["places", "education"], difficulty: "intermediate", masteryLevel: 0,
      nextReviewDate: daysFromNow(0), lastReviewedDate: null,
      timesCorrect: 0, timesIncorrect: 0, isMastered: false, source: "Textbook",
      createdAt: daysAgo(5), updatedAt: daysAgo(5),
    },
    {
      id: crypto.randomUUID(), word: "経験", translation: "experience",
      exampleSentence: "この経験は貴重です。", targetLanguage: "Japanese",
      tags: ["abstract", "business"], difficulty: "advanced", masteryLevel: 1,
      nextReviewDate: daysAgo(2), lastReviewedDate: daysAgo(5),
      timesCorrect: 1, timesIncorrect: 4, isMastered: false, source: "JLPT N2 Study",
      createdAt: daysAgo(10), updatedAt: daysAgo(5),
    },
    {
      id: crypto.randomUUID(), word: "猫", translation: "cat",
      exampleSentence: "猫が庭で遊んでいます。", targetLanguage: "Japanese",
      tags: ["animals", "basics"], difficulty: "beginner", masteryLevel: 5,
      nextReviewDate: daysFromNow(25), lastReviewedDate: daysAgo(1),
      timesCorrect: 10, timesIncorrect: 0, isMastered: true, source: "Anime",
      createdAt: daysAgo(40), updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(), word: "食べ物", translation: "food",
      exampleSentence: "日本の食べ物が大好きです。", targetLanguage: "Japanese",
      tags: ["food", "basics"], difficulty: "beginner", masteryLevel: 4,
      nextReviewDate: daysFromNow(10), lastReviewedDate: daysAgo(2),
      timesCorrect: 7, timesIncorrect: 1, isMastered: false, source: "Cooking show",
      createdAt: daysAgo(28), updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(), word: "勉強する", translation: "to study",
      exampleSentence: "毎日日本語を勉強しています。", targetLanguage: "Japanese",
      tags: ["verbs", "education"], difficulty: "intermediate", masteryLevel: 2,
      nextReviewDate: daysFromNow(0), lastReviewedDate: daysAgo(4),
      timesCorrect: 3, timesIncorrect: 2, isMastered: false, source: "Textbook",
      createdAt: daysAgo(14), updatedAt: daysAgo(4),
    },
    {
      id: crypto.randomUUID(), word: "bonjour", translation: "hello/good day",
      exampleSentence: "Bonjour, comment allez-vous?", targetLanguage: "French",
      tags: ["greetings", "basics"], difficulty: "beginner", masteryLevel: 4,
      nextReviewDate: daysFromNow(7), lastReviewedDate: daysAgo(1),
      timesCorrect: 9, timesIncorrect: 1, isMastered: false, source: "Duolingo",
      createdAt: daysAgo(35), updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(), word: "bibliothèque", translation: "library",
      exampleSentence: "Je vais à la bibliothèque chaque samedi.", targetLanguage: "French",
      tags: ["places", "education"], difficulty: "intermediate", masteryLevel: 2,
      nextReviewDate: daysAgo(1), lastReviewedDate: daysAgo(4),
      timesCorrect: 3, timesIncorrect: 3, isMastered: false, source: "Book: Le Petit Prince",
      createdAt: daysAgo(18), updatedAt: daysAgo(4),
    },
    {
      id: crypto.randomUUID(), word: "entreprendre", translation: "to undertake",
      exampleSentence: "Il faut entreprendre ce projet immédiatement.", targetLanguage: "French",
      tags: ["verbs", "business"], difficulty: "advanced", masteryLevel: 0,
      nextReviewDate: daysFromNow(0), lastReviewedDate: null,
      timesCorrect: 0, timesIncorrect: 0, isMastered: false, source: "News article",
      createdAt: daysAgo(3), updatedAt: daysAgo(3),
    },
    {
      id: crypto.randomUUID(), word: "papillon", translation: "butterfly",
      exampleSentence: "Le papillon vole dans le jardin.", targetLanguage: "French",
      tags: ["nature", "animals"], difficulty: "intermediate", masteryLevel: 3,
      nextReviewDate: daysFromNow(3), lastReviewedDate: daysAgo(2),
      timesCorrect: 6, timesIncorrect: 2, isMastered: false, source: "Duolingo",
      createdAt: daysAgo(22), updatedAt: daysAgo(2),
    },
    {
      id: crypto.randomUUID(), word: "amour", translation: "love",
      exampleSentence: "L'amour est plus fort que tout.", targetLanguage: "French",
      tags: ["emotions", "abstract"], difficulty: "beginner", masteryLevel: 5,
      nextReviewDate: daysFromNow(20), lastReviewedDate: daysAgo(1),
      timesCorrect: 11, timesIncorrect: 0, isMastered: true, source: "Movie: Amélie",
      createdAt: daysAgo(45), updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(), word: "comprendre", translation: "to understand",
      exampleSentence: "Je ne comprends pas cette question.", targetLanguage: "French",
      tags: ["verbs", "basics"], difficulty: "intermediate", masteryLevel: 2,
      nextReviewDate: daysAgo(1), lastReviewedDate: daysAgo(5),
      timesCorrect: 4, timesIncorrect: 3, isMastered: false, source: "Duolingo",
      createdAt: daysAgo(16), updatedAt: daysAgo(5),
    },
    {
      id: crypto.randomUUID(), word: "perro", translation: "dog",
      exampleSentence: "Mi perro es muy juguetón.", targetLanguage: "Spanish",
      tags: ["animals", "basics"], difficulty: "beginner", masteryLevel: 4,
      nextReviewDate: daysFromNow(12), lastReviewedDate: daysAgo(1),
      timesCorrect: 9, timesIncorrect: 1, isMastered: false, source: "Duolingo",
      createdAt: daysAgo(32), updatedAt: daysAgo(1),
    },
    {
      id: crypto.randomUUID(), word: "天気", translation: "weather",
      exampleSentence: "今日の天気はとてもいいです。", targetLanguage: "Japanese",
      tags: ["nature", "basics"], difficulty: "beginner", masteryLevel: 3,
      nextReviewDate: daysFromNow(5), lastReviewedDate: daysAgo(2),
      timesCorrect: 6, timesIncorrect: 1, isMastered: false, source: "NHK News",
      createdAt: daysAgo(20), updatedAt: daysAgo(2),
    },
  ];

  saveVocab(entries);
  saveSettings(defaultSettings());

  // Seed some activity
  const activity: ActivityLog = {};
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (Math.random() > 0.5) {
      activity[key] = Math.floor(Math.random() * 8) + 1;
    }
  }
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}

export function initializeApp() {
  const existing = localStorage.getItem(VOCAB_KEY);
  if (!existing) {
    seedData();
  }
}

// Spaced repetition intervals in days for mastery levels 1-5
export const SR_INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(masteryLevel: number): string {
  const days = masteryLevel >= 1 && masteryLevel <= 5
    ? SR_INTERVALS[masteryLevel - 1]
    : 1;
  return daysFromNow(days);
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
