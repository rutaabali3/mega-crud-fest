import { useEffect, useRef } from "react";
import { Search, Plus, Download, Upload, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNav } from "./MobileNav";
import { MediaStatus, MediaType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { exportItems, importItems } from "@/lib/storage";
import { MediaItem } from "@/lib/types";

interface Props {
  search: string;
  onSearch: (s: string) => void;
  onAddNew: () => void;
  items: MediaItem[];
  onImport: (items: MediaItem[]) => void;
  darkMode: boolean;
  onToggleDark: () => void;
  statusFilter: MediaStatus | "all";
  typeFilter: MediaType | "all";
  onStatusFilter: (s: MediaStatus | "all") => void;
  onTypeFilter: (t: MediaType | "all") => void;
  stats: { total: number; finished: number; avgRating: number };
}

export function TopBar({ search, onSearch, onAddNew, items, onImport, darkMode, onToggleDark, statusFilter, typeFilter, onStatusFilter, onTypeFilter, stats }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importItems(file);
      onImport(data);
      toast({ title: "Imported!", description: `${data.length} items loaded.` });
    } catch {
      toast({ title: "Import failed", description: "Invalid file format.", variant: "destructive" });
    }
    e.target.value = "";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <MobileNav statusFilter={statusFilter} typeFilter={typeFilter} onStatusFilter={onStatusFilter} onTypeFilter={onTypeFilter} stats={stats} />

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input ref={searchRef} value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Search title or creator…" className="pl-9 pr-16 bg-muted/50 border-0" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">⌘K</kbd>
        </div>

        <div className="flex items-center gap-1.5">
          <Button onClick={onAddNew} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => exportItems(items)} title="Export JSON">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} title="Import JSON">
            <Upload className="w-4 h-4" />
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="ghost" size="icon" onClick={onToggleDark}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
