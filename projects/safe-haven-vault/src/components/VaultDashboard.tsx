import { useState, useMemo } from "react";
import { useVault } from "@/contexts/VaultContext";
import { FilterCategory, SortOption, VaultEntry } from "@/lib/types";
import VaultSidebar from "./VaultSidebar";
import EntryCard from "./EntryCard";
import EntryModal from "./EntryModal";
import SettingsPanel from "./SettingsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Lock, Settings, Search, Menu, X, Trash2, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function VaultDashboard() {
  const { entries, lock, deleteEntries } = useVault();
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<VaultEntry | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = entries;
    if (filter === "favorites") result = result.filter((e) => e.favorite);
    else if (filter !== "all") result = result.filter((e) => e.category === filter);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.siteName.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || e.siteUrl.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "newest": return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case "oldest": return [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      case "az": return [...result].sort((a, b) => a.siteName.localeCompare(b.siteName));
      case "updated": return [...result].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      default: return result;
    }
  }, [entries, filter, sort, search]);

  const handleEdit = (entry: VaultEntry) => { setEditEntry(entry); setModalOpen(true); };
  const handleAdd = () => { setEditEntry(null); setModalOpen(true); };
  const toggleSelect = (id: string) => {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleBulkDelete = () => {
    deleteEntries([...selected]);
    setSelected(new Set());
    setSelectMode(false);
  };

  const emptyState = entries.length === 0 ? "empty" : filtered.length === 0 ? "no-results" : null;

  const sidebarContent = <VaultSidebar filter={filter} onFilterChange={(f) => { setFilter(f); setMobileMenuOpen(false); }} />;

  return (
    <div className="flex h-screen bg-background animate-fade-in">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-background border-border">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 border-b border-border shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden flex items-center gap-2 mr-auto">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">VaultX</span>
          </div>

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-36 hidden sm:flex"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={selectMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
          >
            {selectMode ? "Cancel" : "Select"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={lock}>
            <Lock className="w-5 h-5" />
          </Button>
        </header>

        {/* Mobile search */}
        <div className="sm:hidden p-4 pb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {emptyState === "empty" && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-primary/50" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Your vault is empty</h2>
              <p className="text-muted-foreground text-sm mb-4">Add your first entry →</p>
            </div>
          )}
          {emptyState === "no-results" && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <p className="text-muted-foreground mb-2">No entries match "{search}"</p>
              <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear search</Button>
            </div>
          )}
          {!emptyState && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((entry, i) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  selectable={selectMode}
                  selected={selected.has(entry.id)}
                  onSelect={toggleSelect}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bulk delete bar */}
        {selectMode && selected.size > 0 && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
            <Button variant="destructive" className="gap-2 shadow-lg" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4" /> Delete Selected ({selected.size})
            </Button>
          </div>
        )}

        {/* FAB */}
        <button
          onClick={handleAdd}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-30"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <EntryModal open={modalOpen} onOpenChange={setModalOpen} editEntry={editEntry} />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
