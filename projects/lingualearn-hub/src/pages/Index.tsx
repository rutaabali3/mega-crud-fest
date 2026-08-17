import { useState, useEffect, useMemo, useCallback } from "react";
import { useVocabContext } from "@/lib/VocabContext";
import { VocabEntry, SortOption, DifficultyFilter } from "@/lib/types";
import { VocabCard } from "@/components/VocabCard";
import { AddEditDrawer } from "@/components/AddEditDrawer";
import { Search, Plus, X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Index = () => {
  const { entries, deleteEntry, deleteEntries, updateEntry } = useVocabContext();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VocabEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        setEditingEntry(null);
        setDrawerOpen(true);
      }
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setBulkMode(false);
        setSelectedIds(new Set());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const languages = useMemo(() => [...new Set(entries.map(e => e.targetLanguage))], [entries]);
  const allTags = useMemo(() => [...new Set(entries.flatMap(e => e.tags))], [entries]);
  const hasMastered = entries.some(e => e.isMastered);

  const filtered = useMemo(() => {
    let result = entries;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(e =>
        e.word.toLowerCase().includes(q) ||
        e.translation.toLowerCase().includes(q) ||
        e.tags.some(t => t.includes(q))
      );
    }

    if (languageFilter !== "all") {
      result = result.filter(e => e.targetLanguage === languageFilter);
    }

    if (difficultyFilter !== "all") {
      result = result.filter(e => e.difficulty === difficultyFilter);
    }

    if (tagFilter) {
      result = result.filter(e => e.tags.includes(tagFilter));
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "alphabetical": return a.word.localeCompare(b.word);
        case "mastery": return a.masteryLevel - b.masteryLevel;
        case "nextReview": return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
        default: return 0;
      }
    });

    return result;
  }, [entries, debouncedSearch, languageFilter, difficultyFilter, tagFilter, sort]);

  const handleEdit = (entry: VocabEntry) => {
    setEditingEntry(entry);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast({ title: "Word deleted", description: "The word has been removed." });
  };

  const handleMastered = (entry: VocabEntry) => {
    updateEntry(entry.id, { isMastered: true, masteryLevel: 5 });
    toast({ title: "Word mastered! 🎉", description: `"${entry.word}" marked as mastered.` });
  };

  const handleUnmaster = (entry: VocabEntry) => {
    updateEntry(entry.id, { isMastered: false, masteryLevel: 3, nextReviewDate: new Date().toISOString() });
    toast({ title: "Word reset to learning 🔄", description: `"${entry.word}" is back in your review queue.` });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    if (next.size === 0) setBulkMode(false);
  };

  const handleBulkDelete = () => {
    deleteEntries([...selectedIds]);
    toast({ title: `${selectedIds.size} words deleted` });
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const handleBulkMaster = () => {
    selectedIds.forEach(id => updateEntry(id, { isMastered: true, masteryLevel: 5 }));
    toast({ title: `${selectedIds.size} words mastered! 🎉` });
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const clearMastered = () => {
    const masteredIds = entries.filter(e => e.isMastered).map(e => e.id);
    deleteEntries(masteredIds);
    toast({ title: `${masteredIds.length} mastered words cleared` });
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold mb-2">Your vocabulary bank is empty</h2>
        <p className="text-muted-foreground mb-6">Start building your vocabulary by adding your first word!</p>
        <Button onClick={() => { setEditingEntry(null); setDrawerOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add your first word
        </Button>
        <AddEditDrawer open={drawerOpen} onOpenChange={setDrawerOpen} entry={editingEntry} allTags={allTags} languages={languages} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words, translations, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
            className={cn(bulkMode && "bg-primary/10 text-primary")}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            Select
          </Button>
          <Button onClick={() => { setEditingEntry(null); setDrawerOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Word
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={languageFilter}
          onChange={e => setLanguageFilter(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-background"
        >
          <option value="all">All Languages</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <div className="flex gap-1">
          {(["all", "beginner", "intermediate", "advanced"] as DifficultyFilter[]).map(d => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={cn(
                "px-3 py-1 text-xs rounded-full capitalize transition-default font-medium",
                difficultyFilter === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="text-sm border rounded-lg px-3 py-1.5 bg-background ml-auto"
        >
          <option value="newest">Newest</option>
          <option value="alphabetical">A → Z</option>
          <option value="mastery">Mastery ↑</option>
          <option value="nextReview">Next Review</option>
        </select>

        {hasMastered && (
          <Button variant="outline" size="sm" onClick={clearMastered} className="text-xs">
            Clear Mastered
          </Button>
        )}
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {tagFilter && (
            <button onClick={() => setTagFilter(null)} className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive flex items-center gap-1 shrink-0">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={cn(
                "px-2.5 py-0.5 text-xs rounded-full shrink-0 transition-default",
                tagFilter === tag
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} word{filtered.length !== 1 ? "s" : ""}</p>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(entry => (
          <VocabCard
            key={entry.id}
            entry={entry}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMastered={handleMastered}
            onUnmaster={handleUnmaster}
            bulkMode={bulkMode}
            selected={selectedIds.has(entry.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No words match your filters</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-card border rounded-xl shadow-lg px-6 py-3 flex items-center gap-4 z-50">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete Selected</Button>
          <Button size="sm" onClick={handleBulkMaster} className="bg-success hover:bg-success/90 text-success-foreground">Mark Mastered</Button>
        </div>
      )}

      <AddEditDrawer open={drawerOpen} onOpenChange={setDrawerOpen} entry={editingEntry} allTags={allTags} languages={languages} />
    </div>
  );
};

export default Index;
