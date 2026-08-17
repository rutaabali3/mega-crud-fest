import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { CelestialBody } from "@/types/celestial";

interface AddBodyModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (body: Omit<CelestialBody, "id" | "createdAt">) => void;
  editBody?: CelestialBody | null;
  onUpdate?: (id: string, updates: Partial<CelestialBody>) => void;
}

const BODY_TYPES: CelestialBody["type"][] = ["planet", "moon", "comet", "star"];
const TYPE_EMOJIS = { planet: "🪐", moon: "🌙", comet: "☄️", star: "⭐" };

const PRESET_COLORS = [
  "#4A9EE0", "#E06B4A", "#50C878", "#FFD700",
  "#DA70D6", "#FF6B6B", "#4ECDC4", "#F093FB",
];

export function AddBodyModal({ open, onClose, onAdd, editBody, onUpdate }: AddBodyModalProps) {
  const [name, setName] = useState(editBody?.name ?? "");
  const [type, setType] = useState<CelestialBody["type"]>(editBody?.type ?? "planet");
  const [size, setSize] = useState(editBody?.size ?? 1.0);
  const [distance, setDistance] = useState(editBody?.distance ?? 10);
  const [speed, setSpeed] = useState(editBody?.speed ?? 0.5);
  const [color, setColor] = useState(editBody?.color ?? "#4A9EE0");
  const [note, setNote] = useState(editBody?.note ?? "");
  const [category, setCategory] = useState(editBody?.category ?? "");

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editBody && onUpdate) {
      onUpdate(editBody.id, { name, type, size, distance, speed, color, note, category });
    } else {
      onAdd({ name, type, size, distance, speed, color, note, category });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="glass relative z-10 w-full max-w-md rounded-2xl p-6 glow-gold"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">
                <Sparkles className="mb-1 mr-2 inline h-5 w-5" />
                {editBody ? "Edit Body" : "Add Celestial Body"}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Name */}
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What does this represent?"
                  className="mt-1 bg-secondary/50 border-border/50"
                />
              </div>

              {/* Type */}
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {BODY_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`rounded-lg border px-2 py-2 text-center text-sm transition-all ${
                        type === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <span className="block text-lg">{TYPE_EMOJIS[t]}</span>
                      <span className="text-xs capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <Label className="text-xs text-muted-foreground">Color</Label>
                <div className="mt-1 flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        color === c ? "border-primary scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent"
                  />
                </div>
              </div>

              {/* Size */}
              <div>
                <Label className="text-xs text-muted-foreground">Size — {size.toFixed(1)}</Label>
                <Slider
                  value={[size]}
                  onValueChange={([v]) => setSize(v)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Distance */}
              <div>
                <Label className="text-xs text-muted-foreground">Orbit Distance — {distance}</Label>
                <Slider
                  value={[distance]}
                  onValueChange={([v]) => setDistance(v)}
                  min={5}
                  max={25}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Speed */}
              <div>
                <Label className="text-xs text-muted-foreground">Orbit Speed — {speed.toFixed(1)}</Label>
                <Slider
                  value={[speed]}
                  onValueChange={([v]) => setSpeed(v)}
                  min={0.1}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Love, Career, Memories…"
                  className="mt-1 bg-secondary/50 border-border/50"
                />
              </div>

              {/* Note */}
              <div>
                <Label className="text-xs text-muted-foreground">Note</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's the story behind this?"
                  rows={3}
                  className="mt-1 bg-secondary/50 border-border/50 resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-gold"
            >
              {editBody ? "Update" : "Add to Orbit"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
