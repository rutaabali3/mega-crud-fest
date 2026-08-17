import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { CelestialBody } from "@/types/celestial";

const TYPE_EMOJIS = { planet: "🪐", moon: "🌙", comet: "☄️", star: "⭐" };

interface InfoCardProps {
  body: CelestialBody | null;
  onClose: () => void;
}

export function InfoCard({ body, onClose }: InfoCardProps) {
  return (
    <AnimatePresence>
      {body && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div className="glass rounded-2xl p-5 glow-gold">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: body.color }}
                />
                <h3 className="text-lg font-semibold text-foreground">
                  {TYPE_EMOJIS[body.type]} {body.name}
                </h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {body.category && (
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mb-2">
                {body.category}
              </span>
            )}
            {body.note && (
              <p className="text-sm text-muted-foreground leading-relaxed">{body.note}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground/60">
              Created {new Date(body.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
