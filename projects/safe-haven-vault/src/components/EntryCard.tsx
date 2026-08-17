import { useState, useEffect } from "react";
import { VaultEntry, CATEGORIES } from "@/lib/types";
import { useVault } from "@/contexts/VaultContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye, EyeOff, Copy, Pencil, Trash2, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Props {
  entry: VaultEntry;
  onEdit: (entry: VaultEntry) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  index: number;
}

export default function EntryCard({ entry, onEdit, selectable, selected, onSelect, index }: Props) {
  const { decryptField, deleteEntry, toggleFavorite } = useVault();
  const [showPw, setShowPw] = useState(false);
  const [decryptedPw, setDecryptedPw] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const category = CATEGORIES.find((c) => c.value === entry.category);
  const faviconUrl = entry.siteUrl
    ? `https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(entry.siteUrl.startsWith("http") ? entry.siteUrl : `https://${entry.siteUrl}`).hostname; } catch { return ""; } })()}&sz=32`
    : null;

  const handleShowPw = async () => {
    if (showPw) { setShowPw(false); return; }
    const pw = await decryptField(entry.password);
    setDecryptedPw(pw);
    setShowPw(true);
  };

  const handleCopy = async () => {
    const pw = await decryptField(entry.password);
    await navigator.clipboard.writeText(pw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    const toastId = toast("Clipboard clears in 30s", {
      duration: 30000,
      action: { label: "Clear now", onClick: () => navigator.clipboard.writeText("") },
    });

    setTimeout(() => {
      navigator.clipboard.writeText("");
    }, 30000);
  };

  const initials = entry.siteName.slice(0, 2).toUpperCase();

  return (
    <div
      className="rounded-lg border border-border bg-card p-4 card-glow card-glow-hover transition-all animate-fade-in-up relative group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {selectable && (
        <button
          className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            selected ? "bg-primary border-primary" : "border-border hover:border-primary/50"
          }`}
          onClick={() => onSelect?.(entry.id)}
        >
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="w-10 h-10 rounded-lg bg-muted p-1"
              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden"); }}
            />
          ) : null}
          <div className={`w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary ${faviconUrl ? "hidden" : ""}`}>
            {initials}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{entry.siteName}</h3>
            <button onClick={() => toggleFavorite(entry.id)} className="shrink-0">
              <Star className={`w-4 h-4 transition-colors ${entry.favorite ? "fill-warning text-warning" : "text-muted-foreground hover:text-warning"}`} />
            </button>
          </div>
          {entry.siteUrl && (
            <p className="text-xs text-muted-foreground truncate">{entry.siteUrl}</p>
          )}
          <p className="text-sm text-foreground/80 mt-1">{entry.username}</p>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-sm text-muted-foreground">
              {showPw ? decryptedPw : "●●●●●●●●"}
            </span>
            <button onClick={handleShowPw} className="text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-[10px] px-2 py-0.5 rounded-badge bg-primary/15 text-primary font-medium">
          {category?.emoji} {category?.label}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
        </span>
      </div>

      <div className="flex gap-1 mt-3">
        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleCopy}>
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => onEdit(entry)}>
          <Pencil className="w-3 h-3" /> Edit
        </Button>
        <Popover open={deleteOpen} onOpenChange={setDeleteOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs gap-1 text-destructive hover:text-destructive">
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 bg-card border-border">
            <p className="text-sm text-foreground mb-3">Delete <strong>{entry.siteName}</strong>? This cannot be undone.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => {
                  deleteEntry(entry.id);
                  setDeleteOpen(false);
                  toast.success("Entry deleted 🗑️");
                }}
              >
                Delete
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
