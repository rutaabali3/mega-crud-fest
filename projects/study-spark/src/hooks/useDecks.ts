import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Deck, DeckColor } from '@/types/flashcard';

export function useDecks() {
  const [decks, setDecks] = useLocalStorage<Deck[]>('flashcard_decks', []);

  const createDeck = useCallback((subject: string, color: DeckColor) => {
    const deck: Deck = {
      id: crypto.randomUUID(),
      subject,
      color,
      createdAt: new Date().toISOString(),
      lastStudied: null,
    };
    setDecks(prev => [...prev, deck]);
    return deck;
  }, [setDecks]);

  const updateDeck = useCallback((id: string, updates: Partial<Pick<Deck, 'subject' | 'color'>>) => {
    setDecks(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [setDecks]);

  const deleteDeck = useCallback((id: string) => {
    setDecks(prev => prev.filter(d => d.id !== id));
  }, [setDecks]);

  const markStudied = useCallback((id: string) => {
    setDecks(prev => prev.map(d => d.id === id ? { ...d, lastStudied: new Date().toISOString() } : d));
  }, [setDecks]);

  return { decks, setDecks, createDeck, updateDeck, deleteDeck, markStudied };
}
