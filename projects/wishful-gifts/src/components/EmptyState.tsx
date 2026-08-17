import { Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in-up">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Gift className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Start adding wishes for yourself or others. Track gifts, set priorities, and never forget a special occasion!
      </p>
      <Button onClick={onAdd} className="gap-2 rounded-full px-6">
        <Plus className="h-4 w-4" />
        Add Your First Wish
      </Button>
    </div>
  );
}
