import { useState, useCallback } from "react";
import { CinemaItem } from "@/types/cinema";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5, ImageOff, Play, SkipForward, Eye, CheckCircle } from "lucide-react";

interface RandomPickPageProps {
  getRandomPick: () => CinemaItem | null;
  onUpdate: (id: string, updates: Partial<CinemaItem>) => void;
}

export function RandomPickPage({ getRandomPick, onUpdate }: RandomPickPageProps) {
  const [pick, setPick] = useState<CinemaItem | null>(null);
  const [spinning, setSpinning] = useState(false);

  const doPick = useCallback(() => {
    setSpinning(true);
    setTimeout(() => {
      setPick(getRandomPick());
      setSpinning(false);
    }, 600);
  }, [getRandomPick]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Random Pick</h1>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={doPick}
          className="text-lg px-8 py-6 gap-3 glow-purple"
          disabled={spinning}
        >
          <Dice5 className={`h-6 w-6 ${spinning ? "animate-dice-spin" : ""}`} />
          Give me something to watch tonight
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {pick && !spinning && (
          <motion.div
            key={pick.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-lg mx-auto rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="aspect-[2/3] max-h-[400px] relative bg-muted">
              {pick.posterUrl ? (
                <img src={pick.posterUrl} alt={pick.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageOff className="h-16 w-16" />
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <h2 className="text-2xl font-bold">{pick.title}</h2>
              {pick.personalRating > 0 && <StarRating rating={pick.personalRating} readonly />}
              {pick.review && (
                <p className="text-sm text-muted-foreground line-clamp-3">{pick.review}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" className="gap-1.5" onClick={() => {}}>
                  <Play className="h-3.5 w-3.5" /> Watch Now 🍿
                </Button>
                <Button size="sm" variant="outline" onClick={doPick} className="gap-1.5">
                  <SkipForward className="h-3.5 w-3.5" /> Pick Another
                </Button>
                {pick.status !== "Watching" && (
                  <Button size="sm" variant="secondary" onClick={() => { onUpdate(pick.id, { status: "Watching" }); setPick({ ...pick, status: "Watching" }); }} className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Move to Watching
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => { onUpdate(pick.id, { status: "Watched" }); setPick(null); }} className="gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> Already Watched
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!pick && !spinning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
          <div className="text-5xl mb-3">🎲</div>
          <p>Press the button to get a random pick from your watchlist!</p>
        </motion.div>
      )}
    </div>
  );
}
