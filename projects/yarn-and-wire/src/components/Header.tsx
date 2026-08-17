import { Scissors, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCraft } from "@/context/CraftContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  onNewProject: () => void;
}

export function Header({ onNewProject }: HeaderProps) {
  const { searchQuery, setSearchQuery } = useCraft();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-sm px-4">
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <Scissors className="h-5 w-5 text-primary" />
        <h1 className="font-display text-lg font-semibold text-foreground hidden sm:block">
          My Craft Studio
        </h1>
      </div>
      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-muted/50"
          />
        </div>
      </div>
      <Button onClick={onNewProject} size="sm" className="hidden sm:flex gap-1.5">
        <Plus className="h-4 w-4" /> New Project
      </Button>
    </header>
  );
}
