import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { QuizResult } from '@/types/flashcard';

export function useQuizHistory() {
  const [history, setHistory] = useLocalStorage<QuizResult[]>('flashcard_quiz_history', []);

  const addResult = useCallback((result: Omit<QuizResult, 'id'>) => {
    const entry: QuizResult = { ...result, id: crypto.randomUUID() };
    setHistory(prev => [entry, ...prev]);
    return entry;
  }, [setHistory]);

  const deleteByDeck = useCallback((deckId: string) => {
    setHistory(prev => prev.filter(r => r.deckId !== deckId));
  }, [setHistory]);

  return { history, addResult, deleteByDeck };
}
