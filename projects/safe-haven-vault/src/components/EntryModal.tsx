import { useState, useEffect } from "react";
import { useVault, EntryFormData } from "@/contexts/VaultContext";
import { VaultEntry, CATEGORIES, Category, EncryptedField } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, EyeOff, Star, Wand2, ChevronDown, Clock } from "lucide-react";
import PasswordGenerator from "./PasswordGenerator";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEntry?: VaultEntry | null;
}

export default function EntryModal({ open, onOpenChange, editEntry }: Props) {
  const { addEntry, updateEntry, decryptField } = useVault();
  const [form, setForm] = useState<EntryFormData>({
    siteName: "", siteUrl: "", username: "", password: "", notes: "", category: "Other", favorite: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [historyPasswords, setHistoryPasswords] = useState<{ password: string; changedAt: string }[]>([]);
  const [revealedHistory, setRevealedHistory] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setShowGenerator(false); setRevealedHistory(new Set()); return; }
    if (editEntry) {
      (async () => {
        const pw = await decryptField(editEntry.password);
        const notes = editEntry.notes ? await decryptField(editEntry.notes) : "";
        setForm({
          siteName: editEntry.siteName, siteUrl: editEntry.siteUrl, username: editEntry.username,
          password: pw, notes, category: editEntry.category, favorite: editEntry.favorite,
        });
        // Decrypt history
        const hist = [];
        for (const h of editEntry.passwordHistory) {
          const p = await decryptField(h.password);
          hist.push({ password: p, changedAt: h.changedAt });
        }
        setHistoryPasswords(hist);
      })();
    } else {
      setForm({ siteName: "", siteUrl: "", username: "", password: "", notes: "", category: "Other", favorite: false });
      setHistoryPasswords([]);
    }
  }, [open, editEntry]);

  const handleSave = async () => {
    if (!form.siteName.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Site Name, Username, and Password are required");
      return;
    }
    setLoading(true);
    try {
      if (editEntry) {
        await updateEntry(editEntry.id, form);
        toast.success("Entry updated ✅");
      } else {
        await addEntry(form);
        toast.success("Entry saved 🔒");
      }
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const faviconUrl = form.siteUrl
    ? `https://www.google.com/s2/favicons?domain=${new URL(form.siteUrl.startsWith("http") ? form.siteUrl : `https://${form.siteUrl}`).hostname}&sz=32`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {faviconUrl && <img src={faviconUrl} alt="" className="w-5 h-5" onError={(e) => (e.currentTarget.style.display = "none")} />}
            {editEntry ? "Edit Entry" : "Add New Entry"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name *</Label>
            <Input value={form.siteName} onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))} placeholder="e.g. Twitter" />
          </div>

          <div className="space-y-2">
            <Label>Site URL</Label>
            <Input value={form.siteUrl} onChange={(e) => setForm((f) => ({ ...f, siteUrl: e.target.value }))} placeholder="https://twitter.com" />
          </div>

          <div className="space-y-2">
            <Label>Username / Email *</Label>
            <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="john@example.com" />
          </div>

          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setShowGenerator(!showGenerator)}>
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
            <PasswordStrengthMeter password={form.password} />
            {showGenerator && (
              <PasswordGenerator
                onUse={(pw) => setForm((f) => ({ ...f, password: pw }))}
                onClose={() => setShowGenerator(false)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Notes <span className="text-muted-foreground text-xs">({form.notes.length}/300)</span></Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value.slice(0, 300) }))}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Favorite</Label>
              <Button
                type="button"
                variant="outline"
                className={`w-full ${form.favorite ? "text-warning border-warning/50" : ""}`}
                onClick={() => setForm((f) => ({ ...f, favorite: !f.favorite }))}
              >
                <Star className={`w-4 h-4 mr-1 ${form.favorite ? "fill-warning" : ""}`} />
                {form.favorite ? "Favorited" : "Add to Favorites"}
              </Button>
            </div>
          </div>

          {editEntry && historyPasswords.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full">
                <Clock className="w-3 h-3" />
                <span>Password History ({historyPasswords.length})</span>
                <ChevronDown className="w-3 h-3 ml-auto" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {historyPasswords.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md bg-muted p-2 text-xs">
                    <button
                      className="font-mono text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setRevealedHistory((s) => {
                        const n = new Set(s);
                        n.has(i) ? n.delete(i) : n.add(i);
                        return n;
                      })}
                    >
                      {revealedHistory.has(i) ? h.password : "●●●●●●●●"}
                    </button>
                    <span className="text-muted-foreground">{new Date(h.changedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : editEntry ? "Update Entry" : "Save Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
