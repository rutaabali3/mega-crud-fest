import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border">
      <h1 className="text-xl font-bold text-primary">💰 FinTrack</h1>
      <Button variant="ghost" size="icon" onClick={cycleTheme}>
        {theme === "light" && <Sun className="h-5 w-5" />}
        {theme === "dark" && <Moon className="h-5 w-5" />}
        {theme === "system" && <Monitor className="h-5 w-5" />}
      </Button>
    </div>
  );
}
