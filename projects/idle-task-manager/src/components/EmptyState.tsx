import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        No tasks yet
      </h2>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        Start your productive day by adding your first task!
      </p>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Task
      </Button>
    </div>
  );
}
