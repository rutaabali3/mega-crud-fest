import { Library, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Library className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h2 className="text-xl font-bold mb-2">Your vault is empty</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">Start tracking books, movies, and games you love. Everything stays private in your browser.</p>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="w-4 h-4" /> Add your first item
      </Button>
    </motion.div>
  );
}
