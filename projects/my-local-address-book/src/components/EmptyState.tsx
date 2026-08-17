import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <Users className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No contacts yet</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Your address book is empty. Add your first contact to get started!
      </p>
      <Button onClick={onAdd} className="gap-2">
        <UserPlus className="h-4 w-4" /> Add First Contact
      </Button>
    </div>
  );
}
