import { useCallback } from "react";
import { BOTTLE_TYPES, TYPE_ICONS, BottleType } from "@/types/bottle";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export type SortKey = "dateAdded" | "name" | "vintage" | "rating" | "pricePaid" | "quantity";

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedTypes: BottleType[];
  onToggleType: (t: BottleType) => void;
  ratingFilter: string;
  onRatingFilterChange: (v: string) => void;
  sortBy: SortKey;
  onSortChange: (v: SortKey) => void;
  showFinished: boolean;
  onToggleFinished: () => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  search, onSearchChange, selectedTypes, onToggleType,
  ratingFilter, onRatingFilterChange, sortBy, onSortChange,
  showFinished, onToggleFinished, resultCount, totalCount,
}: FilterBarProps) {
  return (
    <div className="sticky top-[57px] z-30 glass-card border-b border-border px-4 py-3 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search name, region, notes..."
            className="pl-9"
          />
        </div>

        {/* Rating filter */}
        <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="90">90+ Classic</SelectItem>
            <SelectItem value="80">80–89</SelectItem>
            <SelectItem value="70">70–79</SelectItem>
            <SelectItem value="below">Below 70</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={v => onSortChange(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAdded">Date Added</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="vintage">Vintage</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="pricePaid">Price</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type pills */}
      <div className="flex flex-wrap gap-1.5">
        {BOTTLE_TYPES.map(t => (
          <Badge
            key={t}
            variant={selectedTypes.includes(t) ? "default" : "outline"}
            className="cursor-pointer text-xs transition-colors"
            onClick={() => onToggleType(t)}
          >
            {TYPE_ICONS[t]} {t}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {resultCount} of {totalCount} bottles</span>
        <div className="flex items-center gap-2">
          <Switch id="show-finished" checked={showFinished} onCheckedChange={onToggleFinished} />
          <Label htmlFor="show-finished" className="text-xs cursor-pointer">Show finished</Label>
        </div>
      </div>
    </div>
  );
}
