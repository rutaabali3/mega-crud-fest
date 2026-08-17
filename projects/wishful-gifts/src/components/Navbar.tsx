import { Sun, Moon, Calculator, Share2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenBudget: () => void;
  onOpenShare: () => void;
}

export function Navbar({ theme, onToggleTheme, onOpenBudget, onOpenShare }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            WishVault
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenBudget} className="gap-1.5">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenShare} className="gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
