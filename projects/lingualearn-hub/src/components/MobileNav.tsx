import { Book, RotateCcw, Target, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { title: "Vocab", url: "/", icon: Book, emoji: "📚" },
  { title: "Review", url: "/review", icon: RotateCcw, emoji: "🔁" },
  { title: "Quiz", url: "/quiz", icon: Target, emoji: "🎯" },
  { title: "Stats", url: "/stats", icon: BarChart3, emoji: "📊" },
  { title: "Settings", url: "/settings", icon: Settings, emoji: "⚙️" },
];

export function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 flex justify-around items-center h-16 px-1">
      {items.map((item) => {
        const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg transition-default text-xs",
              active ? "text-primary font-semibold" : "text-muted-foreground"
            )}
          >
            <span className="text-lg">{item.emoji}</span>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
