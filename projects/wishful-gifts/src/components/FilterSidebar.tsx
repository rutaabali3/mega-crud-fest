import { Search, LayoutGrid, List, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ViewMode, SortOption, StatusFilter, Priority, WishItem } from "@/types/wishlist";
import { OCCASIONS } from "@/types/wishlist";

interface FilterSidebarProps {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  people: string[];
  selectedPerson: string;
  onPersonChange: (v: string) => void;
  selectedOccasion: string;
  onOccasionChange: (v: string) => void;
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  priority: Priority | "all";
  onPriorityChange: (v: Priority | "all") => void;
  priceRange: [number, number];
  onPriceRangeChange: (v: [number, number]) => void;
  maxPrice: number;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  purchasedCount: number;
  onClearPurchased: () => void;
  itemCounts: Record<string, number>;
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
            value === o.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function FilterSidebar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  people,
  selectedPerson,
  onPersonChange,
  selectedOccasion,
  onOccasionChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  sort,
  onSortChange,
  purchasedCount,
  onClearPurchased,
  itemCounts,
}: FilterSidebarProps) {
  return (
    <aside className="space-y-5 p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search wishes..."
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* View + Sort */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="flex-1 h-9 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price ↑</SelectItem>
            <SelectItem value="price-desc">Price ↓</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="person-az">Person A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Browse by Person */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          By Person
        </Label>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          <button
            onClick={() => onPersonChange("all")}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
              selectedPerson === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
            }`}
          >
            All People
          </button>
          {people.map((p) => (
            <button
              key={p}
              onClick={() => onPersonChange(p)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition flex items-center justify-between ${
                selectedPerson === p ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              }`}
            >
              <span className="truncate">{p}</span>
              {itemCounts[p] && (
                <Badge variant="secondary" className="text-xs ml-2">
                  {itemCounts[p]}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Browse by Occasion */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          By Occasion
        </Label>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          <button
            onClick={() => onOccasionChange("all")}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
              selectedOccasion === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
            }`}
          >
            All Occasions
          </button>
          {OCCASIONS.map((o) => (
            <button
              key={o.label}
              onClick={() => onOccasionChange(o.label)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition ${
                selectedOccasion === o.label ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
              }`}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </Label>
        <div className="mt-2">
          <PillGroup
            options={[
              { value: "all" as StatusFilter, label: "All" },
              { value: "unclaimed" as StatusFilter, label: "Unclaimed" },
              { value: "claimed" as StatusFilter, label: "Claimed" },
              { value: "purchased" as StatusFilter, label: "Purchased" },
            ]}
            value={status}
            onChange={onStatusChange}
          />
        </div>
      </div>

      {/* Priority */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Priority
        </Label>
        <div className="mt-2">
          <PillGroup
            options={[
              { value: "all" as Priority | "all", label: "All" },
              { value: "high" as Priority, label: "🔴 High" },
              { value: "medium" as Priority, label: "🟡 Med" },
              { value: "low" as Priority, label: "🟢 Low" },
            ]}
            value={priority}
            onChange={onPriorityChange}
          />
        </div>
      </div>

      {/* Price Range */}
      {maxPrice > 0 && (
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price Range
          </Label>
          <div className="mt-3 px-1">
            <Slider
              min={0}
              max={maxPrice}
              step={1}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={(v) => onPriceRangeChange([v[0], v[1]])}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Clear Purchased */}
      {purchasedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-1.5 text-destructive hover:text-destructive"
          onClick={onClearPurchased}
        >
          <Trash2 className="h-3 w-3" />
          Clear Purchased ({purchasedCount})
        </Button>
      )}
    </aside>
  );
}
