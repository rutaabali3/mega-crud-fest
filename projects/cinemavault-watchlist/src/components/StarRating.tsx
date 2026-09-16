import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const sizeMap = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export function StarRating({ rating, onRate, size = "md", readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const iconSize = sizeMap[size];

  return (
    <div
      className="flex gap-0.5"
      role={readonly ? "img" : "radiogroup"}
      aria-label={readonly ? `Rating: ${rating} out of 10 stars` : "Rating"}
    >
      {Array.from({ length: 10 }, (_, i) => {
        const value = i + 1;
        const filled = value <= (hover || rating);
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            role={readonly ? undefined : "radio"}
            aria-checked={readonly ? undefined : value === rating}
            aria-label={`Rate ${value} out of 10 stars`}
            className={cn(
              "transition-all duration-150 rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onClick={() => onRate?.(value)}
            onMouseEnter={() => !readonly && setHover(value)}
            onMouseLeave={() => !readonly && setHover(0)}
          >
            <Star
              aria-hidden="true"
              className={cn(
                iconSize,
                "transition-colors",
                filled
                  ? "fill-secondary text-secondary"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
