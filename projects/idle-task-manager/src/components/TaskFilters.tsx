import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { FilterType } from "@/types/task";
import { cn } from "@/lib/utils";

interface Props {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  search: string;
  setSearch: (s: string) => void;
  counts: { all: number; today: number; upcoming: number; completed: number };
  searchRef: React.RefObject<HTMLInputElement>;
}

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

export function TaskFilters({
  filter,
  setFilter,
  search,
  setSearch,
  counts,
  searchRef,
}: Props) {
  return (
    <div className="space-y-3 px-4 sm:px-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map(({ key, label }) => {
          const count = counts[key];
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {label}
              <Badge
                variant={active ? "secondary" : "outline"}
                className="h-5 min-w-[20px] justify-center px-1.5 text-xs"
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
