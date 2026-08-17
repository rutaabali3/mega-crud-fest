import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDecks } from '@/hooks/useDecks';
import { useCards } from '@/hooks/useCards';
import { useQuizHistory } from '@/hooks/useQuizHistory';
import { needsSeed, applySeed } from '@/lib/seedData';
import type { AppView, Difficulty, DeckColor } from '@/types/flashcard';
import Navbar from '@/components/Navbar';
import DecksView from '@/components/DecksView';
import DeckDetail from '@/components/DeckDetail';
import StudyView from '@/components/StudyView';
import QuizMode from '@/components/QuizMode';
import StatsView from '@/components/StatsView';
import ReviewQueue from '@/components/ReviewQueue';
import { X } from 'lucide-react';

export default function Index() {
  const [view, setView] = useState<AppView>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [studyCards, setStudyCards] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  const { decks, createDeck, updateDeck, deleteDeck, markStudied } = useDecks();
  const { cards, getCardsByDeck, getDueCards, createCard, updateCard, deleteCard, deleteCardsByDeck, reviewCard } = useCards();
  const { history, addResult, deleteByDeck } = useQuizHistory();

  // Seed
  useEffect(() => {
    if (needsSeed()) {
      applySeed();
      setShowWelcome(true);
      window.location.reload();
    }
  }, []);

  const dueCount = getDueCards.length;

  const handleSelectDeck = useCallback((id: string) => {
    setSelectedDeckId(id);
    setView('deck-detail');
  }, []);

  const handleDeleteDeck = useCallback((id: string) => {
    deleteCardsByDeck(id);
    deleteByDeck(id);
    deleteDeck(id);
    if (selectedDeckId === id) { setView('decks'); setSelectedDeckId(null); }
  }, [deleteDeck, deleteCardsByDeck, deleteByDeck, selectedDeckId]);

  const handleStudy = useCallback((deckId: string, mode: 'all' | 'due') => {
    const dc = cards.filter(c => c.deckId === deckId);
    const now = new Date().toISOString();
    const toStudy = mode === 'due' ? dc.filter(c => c.nextReview <= now) : dc;
    if (toStudy.length === 0) return;
    setStudyCards(toStudy.map(c => c.id));
    setSelectedDeckId(deckId);
    markStudied(deckId);
    setView('study');
  }, [cards, markStudied]);

  const handleStudyAllDue = useCallback((cardIds: string[]) => {
    if (cardIds.length === 0) return;
    setStudyCards(cardIds);
    setSelectedDeckId(null);
    setView('study');
  }, []);

  const studyCardObjects = useMemo(() =>
    studyCards.map(id => cards.find(c => c.id === id)).filter(Boolean) as typeof cards,
    [studyCards, cards]
  );

  const selectedDeck = decks.find(d => d.id === selectedDeckId);
  const selectedDeckCards = selectedDeckId ? getCardsByDeck(selectedDeckId) : [];

  const handleNav = useCallback((v: AppView) => {
    setView(v);
    if (v === 'decks') setSelectedDeckId(null);
  }, []);

  // Study/Quiz are full-screen
  if (view === 'study' && studyCardObjects.length > 0) {
    const dn = selectedDeck?.subject || 'Review Queue';
    return (
      <StudyView
        cards={studyCardObjects}
        deckName={dn}
        onExit={() => { setView(selectedDeckId ? 'deck-detail' : 'decks'); }}
        onRate={(cardId, quality) => reviewCard(cardId, quality)}
        onComplete={() => { if (selectedDeckId) markStudied(selectedDeckId); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-dots">
      <Navbar activeView={view === 'deck-detail' ? 'decks' : view} onNavigate={handleNav} dueCount={dueCount} />

      {showWelcome && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-4">
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-5 py-3 animate-fade-in">
            <p className="text-sm text-foreground">👋 <strong>Welcome to FlashForge!</strong> We've added some sample decks to get you started.</p>
            <button onClick={() => setShowWelcome(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {view === 'decks' && (
        <DecksView
          decks={decks}
          cards={cards}
          onSelectDeck={handleSelectDeck}
          onCreateDeck={(s, c) => createDeck(s, c)}
          onDeleteDeck={handleDeleteDeck}
          onEditDeck={(id, s, c) => updateDeck(id, { subject: s, color: c })}
          onStudyDeck={handleStudy}
        />
      )}

      {view === 'deck-detail' && selectedDeck && (
        <DeckDetail
          deck={selectedDeck}
          cards={selectedDeckCards}
          onBack={() => { setView('decks'); setSelectedDeckId(null); }}
          onStudy={(mode) => handleStudy(selectedDeck.id, mode)}
          onQuiz={() => { setView('quiz-mode'); }}
          onCreateCard={(f, b, d) => createCard(selectedDeck.id, f, b, d)}
          onUpdateCard={(id, f, b, d) => updateCard(id, { front: f, back: b, difficulty: d })}
          onDeleteCard={deleteCard}
          onDeleteDeck={() => handleDeleteDeck(selectedDeck.id)}
        />
      )}

      {view === 'review-queue' && (
        <ReviewQueue decks={decks} cards={cards} onStudyAll={handleStudyAllDue} />
      )}

      {view === 'quiz-mode' && (
        <QuizMode
          decks={decks}
          cards={cards}
          initialDeckId={selectedDeckId || undefined}
          onExit={() => { setView(selectedDeckId ? 'deck-detail' : 'decks'); }}
          onSaveResult={addResult}
        />
      )}

      {view === 'stats' && (
        <StatsView decks={decks} cards={cards} history={history} />
      )}
    </div>
  );
}
