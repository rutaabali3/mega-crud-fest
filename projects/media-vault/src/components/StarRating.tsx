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
    <div
      className="flex items-center gap-0.5"
      role={!interactive ? "img" : undefined}
      aria-label={!interactive ? `${rating} of ${max} stars` : undefined}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = (i + 1) * 2;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            tabIndex={!interactive ? -1 : 0}
            onClick={() => onChange?.(starValue)}
            aria-label={interactive ? `Rate ${starValue} out of ${max} stars` : `${starValue} of ${max} stars`}
            aria-pressed={interactive ? starValue === rating : undefined}
            className={cn(
              "transition-colors disabled:cursor-default rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              interactive && "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                i < filled
                  ? "fill-[hsl(var(--status-want))] text-[hsl(var(--status-want))]"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
      {size !== "sm" && <span className="ml-1 text-xs text-muted-foreground">{rating}/{max}</span>}
    </div>
  );
}
