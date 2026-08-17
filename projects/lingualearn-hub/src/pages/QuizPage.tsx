import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useVocabContext } from "@/lib/VocabContext";
import { VocabEntry, QuizMode } from "@/lib/types";
import { getNextReviewDate, logActivity, levenshtein } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Flame, Trophy, Zap } from "lucide-react";

interface QuizResult {
  entry: VocabEntry;
  userAnswer: string;
  correct: boolean;
}

const QuizPage = () => {
  const { entries, settings, updateEntry, updateSettings } = useVocabContext();
  const [mode, setMode] = useState<QuizMode>("flashcard");
  const [quizActive, setQuizActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizEntries, setQuizEntries] = useState<VocabEntry[]>([]);

  // Flashcard state
  const [flipped, setFlipped] = useState(false);

  // MC state
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [mcLocked, setMcLocked] = useState(false);

  // Type state
  const [typeAnswer, setTypeAnswer] = useState("");
  const [typeSubmitted, setTypeSubmitted] = useState(false);
  const [typeCloseMatch, setTypeCloseMatch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableEntries = useMemo(() => entries.filter(e => !e.isMastered), [entries]);
  const canMC = availableEntries.length >= 4;

  const todayStr = new Date().toISOString().split("T")[0];
  const reviewedToday = useMemo(() => {
    return results.length; // during quiz session
  }, [results]);

  const startQuiz = () => {
    const shuffled = [...availableEntries].sort(() => Math.random() - 0.5);
    const batch = shuffled.slice(0, Math.min(settings.dailyGoal, shuffled.length));
    setQuizEntries(batch);
    setCurrentIndex(0);
    setResults([]);
    setShowResults(false);
    setQuizActive(true);
    setFlipped(false);
    setMcSelected(null);
    setMcLocked(false);
    setTypeAnswer("");
    setTypeSubmitted(false);
    setTypeCloseMatch(false);

    if (mode === "multiple-choice" && batch.length > 0) {
      generateMCOptions(batch[0], batch);
    }
  };

  const generateMCOptions = (correct: VocabEntry, pool: VocabEntry[]) => {
    const others = entries.filter(e => e.id !== correct.id);
    const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correct.word, ...shuffledOthers.map(e => e.word)].sort(() => Math.random() - 0.5);
    setMcOptions(options);
  };

  const currentEntry = quizEntries[currentIndex];

  const recordResult = useCallback((correct: boolean, userAnswer: string = "") => {
    if (!currentEntry) return;

    const newLevel = correct
      ? Math.min(5, currentEntry.masteryLevel + 1)
      : Math.max(0, currentEntry.masteryLevel - 1);

    updateEntry(currentEntry.id, {
      masteryLevel: newLevel as any,
      isMastered: newLevel === 5,
      timesCorrect: currentEntry.timesCorrect + (correct ? 1 : 0),
      timesIncorrect: currentEntry.timesIncorrect + (correct ? 0 : 1),
      lastReviewedDate: new Date().toISOString(),
      nextReviewDate: correct ? getNextReviewDate(newLevel) : (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString(); })(),
    });

    logActivity();

    setResults(prev => [...prev, { entry: currentEntry, userAnswer, correct }]);
  }, [currentEntry, updateEntry]);

  const advanceQuiz = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= quizEntries.length) {
      setShowResults(true);
      setQuizActive(false);
    } else {
      setCurrentIndex(nextIdx);
      setFlipped(false);
      setMcSelected(null);
      setMcLocked(false);
      setTypeAnswer("");
      setTypeSubmitted(false);
      setTypeCloseMatch(false);
      if (mode === "multiple-choice") {
        generateMCOptions(quizEntries[nextIdx], quizEntries);
      }
    }
  }, [currentIndex, quizEntries, mode]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!quizActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && mode === "flashcard" && !flipped) {
        e.preventDefault();
        setFlipped(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [quizActive, mode, flipped]);

  useEffect(() => {
    if (quizActive && mode === "type-answer" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, quizActive, mode]);

  // Finish quiz → update streak
  useEffect(() => {
    if (!showResults || results.length === 0) return;
    const correctCount = results.filter(r => r.correct).length;
    const score = Math.round((correctCount / results.length) * 100);

    let newStreak = settings.streakCount;
    if (score >= 60) {
      const lastDate = settings.lastQuizDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastDate === todayStr) {
        // Already quizzed today
      } else if (lastDate === yesterdayStr) {
        newStreak = settings.streakCount + 1;
      } else {
        newStreak = 1;
      }
    }

    const newHigh = score > settings.highScore;

    updateSettings({
      streakCount: newStreak,
      lastQuizDate: todayStr,
      totalQuizzesTaken: settings.totalQuizzesTaken + 1,
      highScore: newHigh ? score : settings.highScore,
    });

    if (newHigh && score > 0) {
      toast({ title: "🎉 New High Score!", description: `You scored ${score}%!` });
    }
  }, [showResults]);

  // Setup screen
  if (!quizActive && !showResults) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <Flame className="h-8 w-8 text-accent mx-auto" />
              <p className="text-2xl font-bold">{settings.streakCount}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <Trophy className="h-8 w-8 text-accent mx-auto" />
              <p className="text-2xl font-bold">{settings.highScore}%</p>
              <p className="text-xs text-muted-foreground">Best Score</p>
            </div>
          </div>
        </div>

        {/* Progress ring simplified as bar */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">Daily Goal</p>
          <Progress value={Math.min(100, (reviewedToday / settings.dailyGoal) * 100)} className="h-3" />
          <p className="text-xs text-center text-muted-foreground">{reviewedToday} / {settings.dailyGoal} words today</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Quiz Mode</p>
          <div className="grid gap-2">
            {[
              { mode: "flashcard" as QuizMode, emoji: "🃏", title: "Flashcard Mode", desc: "Flip cards to reveal answers" },
              { mode: "multiple-choice" as QuizMode, emoji: "📝", title: "Multiple Choice", desc: "Pick from 4 options", disabled: !canMC },
              { mode: "type-answer" as QuizMode, emoji: "⌨️", title: "Type the Answer", desc: "Type the word from translation" },
            ].map(opt => (
              <button
                key={opt.mode}
                onClick={() => !opt.disabled && setMode(opt.mode)}
                disabled={opt.disabled}
                className={cn(
                  "p-4 rounded-xl border text-left transition-default",
                  mode === opt.mode ? "border-primary bg-primary/5" : "hover:bg-muted",
                  opt.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="text-lg mr-2">{opt.emoji}</span>
                <span className="font-medium">{opt.title}</span>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                {opt.disabled && <p className="text-xs text-destructive mt-1">Need at least 4 words</p>}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={startQuiz}
          className="w-full"
          disabled={availableEntries.length === 0}
        >
          {availableEntries.length === 0 ? "No words available" : "Start Quiz"}
        </Button>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const correctCount = results.filter(r => r.correct).length;
    const score = Math.round((correctCount / results.length) * 100);

    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-4">
          <Zap className="h-12 w-12 text-accent mx-auto" />
          <h2 className="text-3xl font-bold">{score}%</h2>
          <p className="text-muted-foreground">{correctCount} / {results.length} correct</p>
          <div className="flex justify-center gap-2">
            <span className="text-sm bg-success/15 text-success px-3 py-1 rounded-full">+{correctCount * 10} XP</span>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2">Word</th>
                <th className="text-left p-2">Your Answer</th>
                <th className="text-left p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-medium">{r.entry.word}</td>
                  <td className="p-2 text-muted-foreground">{r.userAnswer || (r.correct ? "Knew it" : "Didn't know")}</td>
                  <td className="p-2">{r.correct ? <span className="text-success">✓</span> : <span className="text-destructive">✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button onClick={() => { setShowResults(false); setQuizActive(false); }} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  // Active quiz
  if (!currentEntry) return null;

  const progress = ((currentIndex + 1) / quizEntries.length) * 100;

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{currentIndex + 1} / {quizEntries.length}</p>
        <Button variant="ghost" size="sm" onClick={() => { recordResult(false, "skipped"); advanceQuiz(); }}>
          Skip
        </Button>
      </div>
      <Progress value={progress} className="h-2" />

      {/* FLASHCARD MODE */}
      {mode === "flashcard" && (
        <div className="perspective-1000 mt-6">
          <div
            className={cn(
              "relative w-full min-h-[300px] cursor-pointer preserve-3d transition-all duration-500",
              flipped && "rotate-y-180"
            )}
            onClick={() => !flipped && setFlipped(true)}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden border rounded-xl bg-card p-8 flex flex-col items-center justify-center">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium mb-4">{currentEntry.targetLanguage}</span>
              <h2 className="text-3xl font-bold text-center">{currentEntry.word}</h2>
              <p className="text-xs text-muted-foreground mt-4 capitalize">{currentEntry.difficulty}</p>
              <p className="text-xs text-muted-foreground mt-6">Tap or press Space to flip</p>
            </div>
            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 border rounded-xl bg-card p-8 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-center mb-4">{currentEntry.translation}</p>
              {currentEntry.exampleSentence && (
                <p className="text-sm italic text-muted-foreground text-center mb-4">"{currentEntry.exampleSentence}"</p>
              )}
              <div className="flex flex-wrap gap-1 mb-6">
                {currentEntry.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  onClick={(e) => { e.stopPropagation(); recordResult(true, "Knew it"); advanceQuiz(); }}
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                >
                  Knew it ✓
                </Button>
                <Button
                  onClick={(e) => { e.stopPropagation(); recordResult(false, "Didn't know"); advanceQuiz(); }}
                  variant="destructive"
                  className="flex-1"
                >
                  Didn't Know ✗
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLE CHOICE MODE */}
      {mode === "multiple-choice" && (
        <div className="space-y-4 mt-6">
          <div className="text-center border rounded-xl bg-card p-6">
            <p className="text-sm text-muted-foreground mb-2">What is the word for:</p>
            <h2 className="text-2xl font-bold">{currentEntry.translation}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mcOptions.map(option => {
              const isCorrect = option === currentEntry.word;
              const isSelected = mcSelected === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (mcLocked) return;
                    setMcSelected(option);
                    setMcLocked(true);
                    recordResult(isCorrect, option);
                    setTimeout(() => advanceQuiz(), 500);
                  }}
                  disabled={mcLocked}
                  className={cn(
                    "p-4 rounded-xl border text-center font-medium transition-default",
                    !mcLocked && "hover:bg-muted",
                    mcLocked && isCorrect && "border-success bg-success/10 text-success",
                    mcLocked && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TYPE ANSWER MODE */}
      {mode === "type-answer" && (
        <div className="space-y-4 mt-6">
          <div className="text-center border rounded-xl bg-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Translation:</p>
            <h2 className="text-2xl font-bold mb-3">{currentEntry.translation}</h2>
            {currentEntry.exampleSentence && (
              <p className="text-sm text-muted-foreground italic">
                "{currentEntry.exampleSentence.replace(new RegExp(currentEntry.word, "gi"), "______")}"
              </p>
            )}
          </div>

          {!typeSubmitted ? (
            <div className="space-y-3">
              <Input
                ref={inputRef}
                value={typeAnswer}
                onChange={e => setTypeAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleTypeSubmit(); }}
                placeholder="Type your answer..."
                className="text-center text-lg"
              />
              <Button onClick={handleTypeSubmit} className="w-full">Submit</Button>
            </div>
          ) : typeCloseMatch ? (
            <div className="space-y-3 text-center">
              <p className="text-sm">Your answer: <strong>{typeAnswer}</strong></p>
              <p className="text-sm">Correct: <strong>{currentEntry.word}</strong></p>
              <p className="text-sm text-warning">Close enough?</p>
              <div className="flex gap-3">
                <Button onClick={() => { recordResult(true, typeAnswer); setTypeCloseMatch(false); advanceQuiz(); }} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                  Accept ✓
                </Button>
                <Button onClick={() => { recordResult(false, typeAnswer); setTypeCloseMatch(false); advanceQuiz(); }} variant="destructive" className="flex-1">
                  Reject ✗
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className={cn("text-lg font-medium", results[results.length - 1]?.correct ? "text-success" : "text-destructive")}>
                {results[results.length - 1]?.correct ? "Correct! ✓" : "Incorrect ✗"}
              </p>
              <p className="text-sm">The answer was: <strong>{currentEntry.word}</strong></p>
              <Button onClick={advanceQuiz} className="w-full">Next →</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function handleTypeSubmit() {
    const answer = typeAnswer.trim().toLowerCase();
    const correct = currentEntry.word.toLowerCase();

    if (answer === correct) {
      recordResult(true, typeAnswer);
      setTypeSubmitted(true);
    } else {
      const dist = levenshtein(answer, correct);
      if (dist <= 2 && dist > 0) {
        setTypeCloseMatch(true);
        setTypeSubmitted(true);
      } else {
        recordResult(false, typeAnswer);
        setTypeSubmitted(true);
      }
    }
  }
};

export default QuizPage;
