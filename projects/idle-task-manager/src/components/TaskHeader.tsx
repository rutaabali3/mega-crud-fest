import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TaskHeader() {
  const [dark, setDark] = useLocalStorage("taskflow-theme", false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">T</span>
        </div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          TaskFlow
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  );
}
