import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, Trash2, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CelestialBody } from "@/types/celestial";

interface BodySidebarProps {
  open: boolean;
  onClose: () => void;
  bodies: CelestialBody[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (body: CelestialBody) => void;
}

const TYPE_EMOJIS = { planet: "🪐", moon: "🌙", comet: "☄️", star: "⭐" };

export function BodySidebar({ open, onClose, bodies, selectedId, onSelect, onDelete, onEdit }: BodySidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = bodies.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce<Record<string, CelestialBody[]>>((acc, b) => {
    const cat = b.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed right-0 top-0 z-40 h-full w-80 glass border-l border-border/30"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
        >
          <div className="flex h-full flex-col p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Celestial Bodies</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bodies…"
                className="bg-secondary/50 border-border/50 pl-9"
              />
            </div>

            {/* Body list */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {Object.entries(grouped).map(([cat, catBodies]) => (
                <div key={cat}>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{cat}</p>
                  <div className="space-y-1">
                    {catBodies.map((body) => (
                      <motion.div
                        key={body.id}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                          selectedId === body.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-secondary/50"
                        }`}
                        onClick={() => onSelect(body.id)}
                        whileHover={{ x: 2 }}
                      >
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: body.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">
                            {TYPE_EMOJIS[body.type]} {body.name}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(body); }}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(body.id); }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No bodies found</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
