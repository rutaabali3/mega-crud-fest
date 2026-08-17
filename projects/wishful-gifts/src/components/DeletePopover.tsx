import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { WishItem } from "@/types/wishlist";

interface DeletePopoverProps {
  item: WishItem;
  onConfirm: () => void;
  children: React.ReactNode;
}

export function DeletePopover({ item, onConfirm, children }: DeletePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <p className="text-sm">
            Remove "<strong className="truncate">{item.name}</strong>" from your wishlist?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              Yes, Remove
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
