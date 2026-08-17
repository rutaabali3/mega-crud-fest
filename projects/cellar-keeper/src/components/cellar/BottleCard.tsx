import { useMemo } from "react";
import { Bottle, TYPE_ICONS, TYPE_COLORS, getRatingColor, getRatingLabel } from "@/types/bottle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, StickyNote, Wine } from "lucide-react";
import { motion } from "framer-motion";

interface BottleCardProps {
  bottle: Bottle;
  onEdit: (b: Bottle) => void;
  onAddNote: (b: Bottle) => void;
  onFinish: (b: Bottle) => void;
  highlighted?: boolean;
}

export function BottleCard({ bottle, onEdit, onAddNote, onFinish, highlighted }: BottleCardProps) {
  const isExpiringSoon = useMemo(() => {
    if (!bottle.drinkByDate) return null;
    const diff = new Date(bottle.drinkByDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "overdue";
    if (days <= 30) return "urgent";
    if (days <= 90) return "warning";
    return null;
  }, [bottle.drinkByDate]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`glass-card rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10 relative group
        ${bottle.quantity === 1 ? "ring-1 ring-destructive/40" : ""}
        ${bottle.isFinished ? "opacity-60" : ""}
        ${highlighted ? "ring-2 ring-primary shadow-lg shadow-primary/30" : ""}
        ${isExpiringSoon === "overdue" || isExpiringSoon === "urgent" ? "ring-1 ring-amber-500/40" : ""}
      `}
    >
      {/* Photo / Gradient */}
      <div className={`h-40 w-full bg-gradient-to-br ${TYPE_COLORS[bottle.type]} relative overflow-hidden`}>
        {bottle.photoUrl ? (
          <img src={bottle.photoUrl} alt={bottle.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-40">
            {TYPE_ICONS[bottle.type]}
          </div>
        )}
        {isExpiringSoon && (
          <div className="absolute top-2 right-2 text-lg" title={isExpiringSoon === "overdue" ? "Past drink-by date!" : "Expiring soon"}>
            🔔
          </div>
        )}
        <Badge className={`absolute top-2 left-2 ${getRatingColor(bottle.rating)} text-xs font-bold`}>
          {bottle.rating} · {getRatingLabel(bottle.rating)}
        </Badge>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight line-clamp-1">{bottle.name}</h3>
          <Badge variant="outline" className="shrink-0 text-xs">{bottle.vintage}</Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{TYPE_ICONS[bottle.type]} {bottle.type}</span>
          {bottle.region && <span>· {bottle.region}</span>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-primary">${bottle.pricePaid.toFixed(2)}</span>
          <Badge variant={bottle.quantity === 1 ? "destructive" : "secondary"} className="text-xs">
            Qty: {bottle.quantity}
          </Badge>
        </div>

        {bottle.locationInCellar && (
          <p className="text-xs text-muted-foreground">📍 {bottle.locationInCellar}</p>
        )}

        {bottle.tastingNotes && (
          <p className="text-xs italic text-muted-foreground line-clamp-2">{bottle.tastingNotes}</p>
        )}

        {!bottle.isFinished && (
          <div className="flex gap-1 pt-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(bottle)} aria-label="Edit bottle" className="h-8 flex-1 text-xs">
              <Pencil className="mr-1 h-3 w-3" /> Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onAddNote(bottle)} aria-label="Add tasting note" className="h-8 flex-1 text-xs">
              <StickyNote className="mr-1 h-3 w-3" /> Note
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onFinish(bottle)} aria-label="Mark as finished" className="h-8 flex-1 text-xs text-primary">
              <Wine className="mr-1 h-3 w-3" /> Finish
            </Button>
          </div>
        )}

        {bottle.isFinished && bottle.drankOn && (
          <p className="text-xs text-muted-foreground pt-1">🍾 Finished on {new Date(bottle.drankOn).toLocaleDateString()}</p>
        )}
      </div>
    </motion.div>
  );
}
