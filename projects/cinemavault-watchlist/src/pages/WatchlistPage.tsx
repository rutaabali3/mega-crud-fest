import { CinemaItem, ItemStatus } from "@/types/cinema";
import { MovieCard } from "@/components/MovieCard";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { useState } from "react";
import { ListFilter } from "lucide-react";

interface WatchlistPageProps {
  items: CinemaItem[];
  search: string;
  onCardClick: (item: CinemaItem) => void;
  filterStatus?: ItemStatus;
  title: string;
  emptyIcon: string;
  emptyText: string;
  showAvg?: boolean;
}

export function WatchlistPage({ items, search, onCardClick, filterStatus, title, emptyIcon, emptyText, showAvg }: WatchlistPageProps) {
  const [minRating, setMinRating] = useState(0);

  let filtered = filterStatus ? items.filter((i) => i.status === filterStatus) : items;
  if (search) filtered = filtered.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));
  if (minRating > 0) filtered = filtered.filter((i) => i.personalRating >= minRating);

  const avgRating = filtered.length > 0
    ? filtered.filter(i => i.personalRating > 0).reduce((a, b) => a + b.personalRating, 0) / Math.max(filtered.filter(i => i.personalRating > 0).length, 1)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {showAvg && avgRating > 0 && (
          <span className="text-sm bg-secondary/20 text-secondary px-3 py-1 rounded-full font-medium">
            Avg Rating: {avgRating.toFixed(1)}/10
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <ListFilter className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground text-xs">Min rating:</span>
        <Slider
          value={[minRating]}
          onValueChange={([v]) => setMinRating(v)}
          min={0}
          max={10}
          step={1}
          className="w-32"
        />
        <span className="text-xs font-mono text-muted-foreground w-4">{minRating}</span>
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-3">
          <div className="text-5xl">{emptyIcon}</div>
          <p className="text-muted-foreground">{emptyText}</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item) => (
            <MovieCard key={item.id} item={item} onClick={onCardClick} />
          ))}
        </div>
      )}
    </div>
  );
}
