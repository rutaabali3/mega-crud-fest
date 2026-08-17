import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Card, Difficulty } from '@/types/flashcard';

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function getInitialInterval(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 3;
  if (difficulty === 'medium') return 1;
  return 0;
}

// SM-2 algorithm
export function sm2(card: Card, quality: number): Partial<Card> {
  // quality: 0=Blackout, 2=Hard, 3=Okay, 4=Easy
  let { repetitions, easeFactor, intervalDays } = card;

  if (quality < 2) {
    // Failed
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const now = new Date();
  return {
    repetitions,
    easeFactor,
    intervalDays,
    nextReview: addDays(now, intervalDays),
    lastReviewedAt: now.toISOString(),
  };
}

export function useCards() {
  const [cards, setCards] = useLocalStorage<Card[]>('flashcard_cards', []);

  const getCardsByDeck = useCallback((deckId: string) => {
    return cards.filter(c => c.deckId === deckId);
  }, [cards]);

  const getDueCards = useMemo(() => {
    const now = new Date().toISOString();
    return cards.filter(c => c.nextReview <= now);
  }, [cards]);

  const createCard = useCallback((deckId: string, front: string, back: string, difficulty: Difficulty) => {
    const card: Card = {
      id: crypto.randomUUID(),
      deckId,
      front,
      back,
      difficulty,
      nextReview: addDays(new Date(), getInitialInterval(difficulty)),
      intervalDays: getInitialInterval(difficulty) || 1,
      repetitions: 0,
      easeFactor: 2.5,
      createdAt: new Date().toISOString(),
      lastReviewedAt: null,
    };
    setCards(prev => [...prev, card]);
    return card;
  }, [setCards]);

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCards]);

  const deleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, [setCards]);

  const deleteCardsByDeck = useCallback((deckId: string) => {
    setCards(prev => prev.filter(c => c.deckId !== deckId));
  }, [setCards]);

  const reviewCard = useCallback((id: string, quality: number) => {
    setCards(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updates = sm2(c, quality);
      const newDifficulty: Difficulty = quality >= 4 ? 'easy' : quality >= 3 ? 'medium' : 'hard';
      return { ...c, ...updates, difficulty: newDifficulty };
    }));
  }, [setCards]);

  return { cards, setCards, getCardsByDeck, getDueCards, createCard, updateCard, deleteCard, deleteCardsByDeck, reviewCard };
}
