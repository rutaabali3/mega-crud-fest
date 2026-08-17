import { CinemaItem } from "@/types/cinema";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { Film, Tv, ImageOff } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardProps {
  item: CinemaItem;
  onClick: (item: CinemaItem) => void;
}

const statusColors: Record<string, string> = {
  "To Watch": "bg-primary/20 text-primary border-primary/30",
  Watching: "bg-secondary/20 text-secondary border-secondary/30",
  Watched: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function MovieCard({ item, onClick }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer rounded-lg bg-card border border-border overflow-hidden hover:glow-purple transition-shadow duration-300"
      onClick={() => onClick(item)}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div className={`${item.posterUrl ? "hidden" : ""} absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground`}>
          <ImageOff className="h-10 w-10" />
          <span className="text-xs">No poster</span>
        </div>
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant="outline" className={statusColors[item.status] + " text-[10px] px-1.5 py-0"}>
            {item.status}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          {item.type === "Movie" ? (
            <Film className="h-4 w-4 text-primary" />
          ) : (
            <Tv className="h-4 w-4 text-secondary" />
          )}
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm truncate text-foreground">{item.title}</h3>
        {item.personalRating > 0 && <StarRating rating={item.personalRating} size="sm" readonly />}
      </div>
    </motion.div>
  );
}
