import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import LZString from "lz-string";
import type { WishItem } from "@/types/wishlist";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  items: WishItem[];
}

export function ShareModal({ open, onClose, items }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const json = JSON.stringify(items);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return `${window.location.origin}${window.location.pathname}#shared=${compressed}`;
  };

  const handleCopy = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("🔗 Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🔗 Share Your Wishlist</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your wishlist in read-only mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm">
            <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">
              {items.length} items will be shared
            </span>
          </div>

          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Share Link"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            The link contains all your wishlist data encoded in the URL. No server required!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function parseSharedWishlist(): WishItem[] | null {
  const hash = window.location.hash;
  if (!hash.startsWith("#shared=")) return null;
  try {
    const encoded = hash.slice(8);
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as WishItem[];
  } catch {
    return null;
  }
}
