import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (r: number) => void;
}

const sizes = { sm: "w-3.5 h-3.5", md: "w-4 h-4", lg: "w-5 h-5" };

export function StarRating({ rating, max = 10, size = "sm", interactive, onChange }: Props) {
  // Display as 5-star scale (rating/2)
  const filled = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <button key={i} type="button" disabled={!interactive}
          onClick={() => onChange?.((i + 1) * 2)}
          className={cn("transition-colors disabled:cursor-default", interactive && "cursor-pointer hover:scale-110")}>
          <Star className={cn(sizes[size], i < filled
            ? "fill-[hsl(var(--status-want))] text-[hsl(var(--status-want))]"
            : "text-muted-foreground/30")} />
        </button>
      ))}
      {size !== "sm" && <span className="ml-1 text-xs text-muted-foreground">{rating}/10</span>}
    </div>
  );
}
