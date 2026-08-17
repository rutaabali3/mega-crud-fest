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
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => {
        const value = i + 1;
        const filled = value <= (hover || rating);
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-all duration-150",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onClick={() => onRate?.(value)}
            onMouseEnter={() => !readonly && setHover(value)}
            onMouseLeave={() => !readonly && setHover(0)}
          >
            <Star
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
