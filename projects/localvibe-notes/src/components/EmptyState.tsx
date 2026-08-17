import { motion } from "framer-motion";
import { StickyNote, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreate: () => void;
  isTrash?: boolean;
}

export function EmptyState({ onCreate, isTrash }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-sm space-y-6"
      >
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <StickyNote className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {isTrash ? "Trash is empty" : "No note selected"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isTrash
              ? "Deleted notes will appear here"
              : "Select a note from the sidebar or create a new one to get started"}
          </p>
        </div>
        {!isTrash && (
          <Button onClick={onCreate} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4" />
            Create your first note
          </Button>
        )}
      </motion.div>
    </div>
  );
}
