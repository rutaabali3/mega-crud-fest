import { useCallback } from "react";
import { Moon, Sun, BarChart3, LayoutGrid, List, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  viewMode: "grid" | "list";
  onToggleView: () => void;
  onOpenStats: () => void;
  onRandomPick: () => void;
  hasBottles: boolean;
}

export function Navbar({
  theme, onToggleTheme, viewMode, onToggleView, onOpenStats, onRandomPick, hasBottles,
}: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 glass-card border-b border-border px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="font-display text-xl font-bold text-primary sm:text-2xl">
          🍷 My Cellar
        </h1>
        <div className="flex items-center gap-1 sm:gap-2">
          {hasBottles && (
            <>
              <Button variant="ghost" size="icon" onClick={onRandomPick} aria-label="Random bottle picker" className="text-muted-foreground hover:text-primary">
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onOpenStats} aria-label="View analytics" className="text-muted-foreground hover:text-primary">
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onToggleView} aria-label="Toggle view mode" className="text-muted-foreground hover:text-primary">
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme" className="text-muted-foreground hover:text-primary">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </nav>
  );
}
