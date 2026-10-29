import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DecksView from '../components/DecksView';
import type { Deck, Card } from '../types/flashcard';

const mockDecks: Deck[] = [
  {
    id: 'deck-1',
    subject: 'Biology 101',
    color: 'emerald',
    createdAt: new Date().toISOString(),
  },
];

const mockCards: Card[] = [];

describe('DecksView accessibility', () => {
  it('renders deck options button with proper ARIA attributes', () => {
    render(
      <DecksView
        decks={mockDecks}
        cards={mockCards}
        onSelectDeck={vi.fn()}
        onCreateDeck={vi.fn()}
        onDeleteDeck={vi.fn()}
        onEditDeck={vi.fn()}
        onStudyDeck={vi.fn()}
      />
    );

    const menuButton = screen.getByRole('button', { name: 'Options for deck Biology 101' });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
  });
});
