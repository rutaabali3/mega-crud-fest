import type { Deck, Card, QuizResult } from '@/types/flashcard';

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const now = new Date();

const jsDeckId = crypto.randomUUID();
const histDeckId = crypto.randomUUID();

export const seedDecks: Deck[] = [
  { id: jsDeckId, subject: 'JavaScript Fundamentals', color: 'indigo', createdAt: addDays(now, -14), lastStudied: addDays(now, -1) },
  { id: histDeckId, subject: 'World History', color: 'amber', createdAt: addDays(now, -10), lastStudied: addDays(now, -3) },
];

export const seedCards: Card[] = [
  // JS cards
  { id: crypto.randomUUID(), deckId: jsDeckId, front: 'What is a closure in JavaScript?', back: 'A closure is a function that retains access to its lexical scope even when executed outside that scope.', difficulty: 'medium', nextReview: addDays(now, 0), intervalDays: 1, repetitions: 1, easeFactor: 2.5, createdAt: addDays(now, -14), lastReviewedAt: addDays(now, -1) },
  { id: crypto.randomUUID(), deckId: jsDeckId, front: 'What is the difference between let, const, and var?', back: 'var is function-scoped and hoisted; let and const are block-scoped. const cannot be reassigned after declaration.', difficulty: 'easy', nextReview: addDays(now, 3), intervalDays: 6, repetitions: 2, easeFactor: 2.6, createdAt: addDays(now, -14), lastReviewedAt: addDays(now, -2) },
  { id: crypto.randomUUID(), deckId: jsDeckId, front: 'What does the "this" keyword refer to?', back: '"this" refers to the object that is executing the current function. In arrow functions, "this" is inherited from the enclosing scope.', difficulty: 'hard', nextReview: addDays(now, -1), intervalDays: 1, repetitions: 0, easeFactor: 2.2, createdAt: addDays(now, -10), lastReviewedAt: addDays(now, -2) },
  { id: crypto.randomUUID(), deckId: jsDeckId, front: 'What is the event loop?', back: 'The event loop is a mechanism that allows JavaScript to perform non-blocking I/O by offloading operations and processing callbacks from the task queue.', difficulty: 'medium', nextReview: addDays(now, 1), intervalDays: 3, repetitions: 1, easeFactor: 2.5, createdAt: addDays(now, -7), lastReviewedAt: addDays(now, -3) },
  { id: crypto.randomUUID(), deckId: jsDeckId, front: 'What is the difference between == and ===?', back: '== performs type coercion before comparison, while === checks both value and type without coercion (strict equality).', difficulty: 'easy', nextReview: addDays(now, 5), intervalDays: 6, repetitions: 3, easeFactor: 2.7, createdAt: addDays(now, -14), lastReviewedAt: addDays(now, -1) },
  // History cards
  { id: crypto.randomUUID(), deckId: histDeckId, front: 'When did World War II end?', back: 'World War II ended on September 2, 1945, with the formal surrender of Japan aboard the USS Missouri.', difficulty: 'easy', nextReview: addDays(now, 4), intervalDays: 6, repetitions: 2, easeFactor: 2.6, createdAt: addDays(now, -10), lastReviewedAt: addDays(now, -3) },
  { id: crypto.randomUUID(), deckId: histDeckId, front: 'What was the Renaissance?', back: 'A cultural movement spanning the 14th–17th centuries, originating in Italy, characterized by renewed interest in classical art, science, and philosophy.', difficulty: 'medium', nextReview: addDays(now, 0), intervalDays: 3, repetitions: 1, easeFactor: 2.5, createdAt: addDays(now, -10), lastReviewedAt: addDays(now, -3) },
  { id: crypto.randomUUID(), deckId: histDeckId, front: 'Who was Genghis Khan?', back: 'Founder and first Great Khan of the Mongol Empire (1162–1227), which became the largest contiguous land empire in history.', difficulty: 'hard', nextReview: addDays(now, -2), intervalDays: 1, repetitions: 0, easeFactor: 2.1, createdAt: addDays(now, -8), lastReviewedAt: addDays(now, -4) },
  { id: crypto.randomUUID(), deckId: histDeckId, front: 'What caused the French Revolution?', back: 'A combination of social inequality, financial crisis, Enlightenment ideas, and food shortages led to the uprising in 1789.', difficulty: 'medium', nextReview: addDays(now, 1), intervalDays: 3, repetitions: 1, easeFactor: 2.4, createdAt: addDays(now, -7), lastReviewedAt: addDays(now, -4) },
  { id: crypto.randomUUID(), deckId: histDeckId, front: 'What was the Silk Road?', back: 'An ancient network of trade routes connecting the East and West, facilitating the exchange of goods, culture, and ideas from the 2nd century BCE to the 15th century CE.', difficulty: 'easy', nextReview: addDays(now, 6), intervalDays: 6, repetitions: 3, easeFactor: 2.7, createdAt: addDays(now, -10), lastReviewedAt: addDays(now, -3) },
];

export const seedQuizHistory: QuizResult[] = [
  { id: crypto.randomUUID(), deckId: jsDeckId, deckName: 'JavaScript Fundamentals', date: addDays(now, -5), totalCards: 5, correctCount: 4, incorrectCount: 1, durationSeconds: 120, score: 80 },
  { id: crypto.randomUUID(), deckId: jsDeckId, deckName: 'JavaScript Fundamentals', date: addDays(now, -2), totalCards: 5, correctCount: 3, incorrectCount: 2, durationSeconds: 95, score: 60 },
  { id: crypto.randomUUID(), deckId: histDeckId, deckName: 'World History', date: addDays(now, -3), totalCards: 5, correctCount: 5, incorrectCount: 0, durationSeconds: 78, score: 100 },
];

export function needsSeed(): boolean {
  return !localStorage.getItem('flashcard_decks');
}

export function applySeed() {
  localStorage.setItem('flashcard_decks', JSON.stringify(seedDecks));
  localStorage.setItem('flashcard_cards', JSON.stringify(seedCards));
  localStorage.setItem('flashcard_quiz_history', JSON.stringify(seedQuizHistory));
}
