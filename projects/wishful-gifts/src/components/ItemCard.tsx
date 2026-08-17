import { ExternalLink, Edit2, Trash2, CheckCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WishItem, ViewMode } from "@/types/wishlist";
import { CURRENCIES, PRIORITY_CONFIG, OCCASIONS } from "@/types/wishlist";

interface ItemCardProps {
  item: WishItem;
  viewMode: ViewMode;
  readOnly?: boolean;
  onEdit?: (item: WishItem) => void;
  onDelete?: (item: WishItem) => void;
  onClaim?: (item: WishItem) => void;
  onPurchase?: (item: WishItem) => void;
}

function getPriceBadgeClass(price: number) {
  if (price < 25) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (price <= 100) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

function getFaviconUrl(url?: string) {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export function ItemCard({
  item,
  viewMode,
  readOnly = false,
  onEdit,
  onDelete,
  onClaim,
  onPurchase,
}: ItemCardProps) {
  const currency = CURRENCIES.find((c) => c.value === item.currency);
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const occasion = OCCASIONS.find((o) => o.label === item.occasion);
  const favicon = item.imageUrl || getFaviconUrl(item.url);

  const isGrid = viewMode === "grid";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up ${
        isGrid ? "" : "flex items-center gap-4"
      }`}
    >
      {/* Status ribbon */}
      {item.purchased && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-green-500 text-white text-xs">Purchased ✓</Badge>
        </div>
      )}
      {item.claimed && !item.purchased && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-teal-500 text-white text-xs">
            Claimed{item.claimedBy ? ` by ${item.claimedBy}` : ""}
          </Badge>
        </div>
      )}

      {/* Image/favicon */}
      <div
        className={`flex items-center justify-center bg-muted ${
          isGrid ? "h-32 w-full" : "h-20 w-20 shrink-0 rounded-l-2xl"
        }`}
      >
        {favicon ? (
          <img
            src={favicon}
            alt={item.name}
            className="h-12 w-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col gap-2 p-4 ${isGrid ? "" : "py-3"}`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {item.name}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block ml-1 text-primary hover:text-primary/80"
                aria-label="Open link"
              >
                <ExternalLink className="inline h-3 w-3" />
              </a>
            )}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPriceBadgeClass(item.price)}`}>
            {currency?.symbol}{item.price.toLocaleString()}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${priorityConfig.color}`}>
            <span className="animate-pulse-badge">{priorityConfig.dot}</span>
            {priorityConfig.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs font-normal">
            For: {item.forPerson}
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            {occasion?.emoji} {item.occasion}
          </Badge>
        </div>

        {item.notes && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">{item.notes}</p>
        )}

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onEdit?.(item)}
              aria-label="Edit item"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete?.(item)}
              aria-label="Delete item"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
            {!item.claimed && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onClaim?.(item)}
                aria-label="Mark as claimed"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Claim
              </Button>
            )}
            {!item.purchased && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onPurchase?.(item)}
                aria-label="Mark as purchased"
              >
                <ShoppingBag className="h-3 w-3 mr-1" />
                Buy
              </Button>
            )}
          </div>
        )}

        {readOnly && !item.claimed && !item.purchased && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs mt-1 w-fit"
            onClick={() => onClaim?.(item)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Claim this item
          </Button>
        )}
      </div>
    </div>
  );
}
