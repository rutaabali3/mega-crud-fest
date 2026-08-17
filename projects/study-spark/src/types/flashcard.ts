export type DeckColor = 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'teal';

export const DECK_COLORS: { name: DeckColor; value: string }[] = [
  { name: 'indigo', value: '#6366F1' },
  { name: 'rose', value: '#F43F5E' },
  { name: 'amber', value: '#F59E0B' },
  { name: 'emerald', value: '#10B981' },
  { name: 'sky', value: '#0EA5E9' },
  { name: 'violet', value: '#8B5CF6' },
  { name: 'orange', value: '#F97316' },
  { name: 'teal', value: '#14B8A6' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Deck {
  id: string;
  subject: string;
  color: DeckColor;
  createdAt: string;
  lastStudied: string | null;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: Difficulty;
  nextReview: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  createdAt: string;
  lastReviewedAt: string | null;
}

export interface QuizResult {
  id: string;
  deckId: string;
  deckName: string;
  date: string;
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  durationSeconds: number;
  score: number;
}

export type AppView = 'decks' | 'deck-detail' | 'review-queue' | 'quiz-mode' | 'stats' | 'study';
