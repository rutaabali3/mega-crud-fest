import { motion } from "framer-motion";
import { Book, Film, Gamepad2 } from "lucide-react";
import { MediaItem, CREATOR_LABELS, PROGRESS_LABELS } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { StarRating } from "./StarRating";
import { Progress } from "@/components/ui/progress";

const typeIcons = { book: Book, movie: Film, game: Gamepad2 };
const typeGradients = {
  book: "from-amber-500/20 to-orange-500/20",
  movie: "from-blue-500/20 to-purple-500/20",
  game: "from-emerald-500/20 to-cyan-500/20",
};

export function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const Icon = typeIcons[item.type];
  const pct = item.progress.total > 0 ? Math.round((item.progress.current / item.progress.total) * 100) : 0;
  const progressLabel = PROGRESS_LABELS[item.type];

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Cover */}
      <div className="relative aspect-[3/2] overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${typeGradients[item.type]} flex items-center justify-center`}>
            <Icon className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{item.creator}</p>
        <StarRating rating={item.rating} />

        {(item.status === "in-progress" || item.status === "finished") && item.progress.total > 0 && (
          <div className="space-y-1 pt-1">
            <Progress value={pct} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground">
              {item.progress.current} / {item.progress.total} {progressLabel.unit} · {pct}%
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
