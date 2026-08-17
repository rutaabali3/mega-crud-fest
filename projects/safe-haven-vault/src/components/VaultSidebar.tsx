import { CATEGORIES, FilterCategory } from "@/lib/types";
import { useVault } from "@/contexts/VaultContext";
import { Shield, Star } from "lucide-react";

interface Props {
  filter: FilterCategory;
  onFilterChange: (f: FilterCategory) => void;
}

export default function VaultSidebar({ filter, onFilterChange }: Props) {
  const { entries } = useVault();

  const counts: Record<string, number> = { all: entries.length, favorites: entries.filter((e) => e.favorite).length };
  CATEGORIES.forEach((c) => { counts[c.value] = entries.filter((e) => e.category === c.value).length; });

  const items: { key: FilterCategory; label: string; emoji: React.ReactNode }[] = [
    { key: "all", label: "All", emoji: <Shield className="w-4 h-4" /> },
    { key: "favorites", label: "Favorites", emoji: <Star className="w-4 h-4" /> },
    ...CATEGORIES.map((c) => ({ key: c.value as FilterCategory, label: c.label, emoji: <span>{c.emoji}</span> })),
  ];

  return (
    <div className="w-64 shrink-0 border-r border-border bg-background p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-bold text-foreground">VaultX</span>
        <span className="ml-auto text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-badge font-medium">
          {entries.length}
        </span>
      </div>

      <nav className="space-y-1 flex-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onFilterChange(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              filter === item.key
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.emoji}
            <span className="flex-1 text-left">{item.label}</span>
            {counts[item.key] > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-badge">{counts[item.key]}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
