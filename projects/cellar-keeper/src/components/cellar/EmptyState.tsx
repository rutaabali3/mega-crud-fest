import { Wine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
    >
      <div className="text-8xl mb-6 opacity-30">🍷</div>
      <h2 className="font-display text-3xl font-bold mb-3">Your cellar is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Start building your collection — add your first bottle.
      </p>
      <Button onClick={onAdd} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
        <Plus className="h-5 w-5" /> Add Your First Bottle
      </Button>
    </motion.div>
  );
}
