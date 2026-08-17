import { useState, useMemo } from "react";
import { useVocabContext } from "@/lib/VocabContext";
import { MasteryBar } from "@/components/MasteryBar";
import { getNextReviewDate, logActivity } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PartyPopper } from "lucide-react";

const ReviewPage = () => {
  const { entries, updateEntry } = useVocabContext();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const dueEntries = useMemo(() => {
    const now = new Date();
    return entries
      .filter(e => !e.isMastered && new Date(e.nextReviewDate) <= now)
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
  }, [entries]);

  const activeCard = dueEntries.find(e => e.id === activeCardId);

  const handleGotIt = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const newLevel = Math.min(5, entry.masteryLevel + 1) as 0 | 1 | 2 | 3 | 4 | 5;
    updateEntry(id, {
      masteryLevel: newLevel,
      isMastered: newLevel === 5,
      timesCorrect: entry.timesCorrect + 1,
      lastReviewedDate: new Date().toISOString(),
      nextReviewDate: getNextReviewDate(newLevel),
    });
    logActivity();
    toast({ title: "Got it! ✓", description: `Mastery → ${newLevel}/5` });
    advanceToNext(id);
  };

  const handleMissed = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    const newLevel = Math.max(0, entry.masteryLevel - 1) as 0 | 1 | 2 | 3 | 4 | 5;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateEntry(id, {
      masteryLevel: newLevel,
      timesIncorrect: entry.timesIncorrect + 1,
      lastReviewedDate: new Date().toISOString(),
      nextReviewDate: tomorrow.toISOString(),
    });
    logActivity();
    toast({ title: "Missed it ✗", description: "This word will come back tomorrow." });
    advanceToNext(id);
  };

  const advanceToNext = (currentId: string) => {
    setRevealed(false);
    const remaining = dueEntries.filter(e => e.id !== currentId);
    if (remaining.length > 0) {
      setActiveCardId(remaining[0].id);
    } else {
      setActiveCardId(null);
    }
  };

  if (dueEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <PartyPopper className="h-16 w-16 text-accent mb-4" />
        <h2 className="text-2xl font-bold mb-2">You're all caught up! 🎉</h2>
        <p className="text-muted-foreground">No words due for review today. Great job!</p>
        {/* Simple confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // If reviewing a card
  if (activeCard) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Reviewing {dueEntries.length} word{dueEntries.length !== 1 ? "s" : ""} due
        </p>

        <div className="border rounded-xl bg-card p-8 text-center space-y-4">
          <span className={cn("text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium")}>{activeCard.targetLanguage}</span>
          <h2 className="text-3xl font-bold">{activeCard.word}</h2>
          <MasteryBar level={activeCard.masteryLevel} className="max-w-[200px] mx-auto" />

          {!revealed ? (
            <Button onClick={() => setRevealed(true)} className="w-full mt-4">Reveal Translation</Button>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xl text-muted-foreground">{activeCard.translation}</p>
              {activeCard.exampleSentence && (
                <p className="text-sm italic text-muted-foreground">"{activeCard.exampleSentence}"</p>
              )}
              <div className="flex gap-3">
                <Button onClick={() => handleGotIt(activeCard.id)} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                  Got it ✓
                </Button>
                <Button onClick={() => handleMissed(activeCard.id)} variant="destructive" className="flex-1">
                  Missed it ✗
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Words to Review</h2>
        <span className="bg-destructive/15 text-destructive text-xs font-bold px-2 py-0.5 rounded-full">{dueEntries.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dueEntries.map(entry => (
          <div key={entry.id} className="border rounded-xl bg-card p-4 space-y-3">
            <h3 className="text-xl font-bold truncate">{entry.word}</h3>
            <p className="text-sm text-muted-foreground truncate">{entry.translation}</p>
            <MasteryBar level={entry.masteryLevel} />
            <div className="flex flex-wrap gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{entry.targetLanguage}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{entry.difficulty}</span>
            </div>
            <Button
              onClick={() => { setActiveCardId(entry.id); setRevealed(false); }}
              className="w-full"
              size="sm"
            >
              Review Now →
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewPage;
