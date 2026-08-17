import { useState, useCallback, useMemo, useEffect } from "react";
import { Bottle, CellarSettings, ValueLogEntry } from "@/types/bottle";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Navbar } from "@/components/cellar/Navbar";
import { StatsHeader } from "@/components/cellar/StatsHeader";
import { FilterBar, SortKey } from "@/components/cellar/FilterBar";
import { BottleCard } from "@/components/cellar/BottleCard";
import { BottleForm } from "@/components/cellar/BottleForm";
import { FinishBottleModal } from "@/components/cellar/FinishBottleModal";
import { DrinkByAlerts } from "@/components/cellar/DrinkByAlerts";
import { EmptyState } from "@/components/cellar/EmptyState";
import { AnalyticsPanel } from "@/components/cellar/AnalyticsPanel";
import { CellarValuePanel } from "@/components/cellar/CellarValuePanel";
import { BottleType } from "@/types/bottle";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const Index = () => {
  const [bottles, setBottles] = useLocalStorage<Bottle[]>("cellar_bottles", []);
  const [settings, setSettings] = useLocalStorage<CellarSettings>("cellar_settings", { theme: "dark", dismissedAlerts: [] });
  const [valueLog, setValueLog] = useLocalStorage<ValueLogEntry[]>("cellar_value_log", []);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [editBottle, setEditBottle] = useState<Bottle | null>(null);
  const [finishBottle, setFinishBottle] = useState<Bottle | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<BottleType[]>([]);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("dateAdded");
  const [showFinished, setShowFinished] = useState(false);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }));
  }, [setSettings]);

  // Value log tracking
  useEffect(() => {
    const active = bottles.filter(b => !b.isFinished);
    const totalValue = active.reduce((s, b) => s + b.pricePaid * b.quantity, 0);
    const today = new Date().toISOString().split("T")[0];
    setValueLog(prev => {
      const last = prev[prev.length - 1];
      if (last?.date === today) {
        return [...prev.slice(0, -1), { date: today, totalValue }];
      }
      return [...prev, { date: today, totalValue }];
    });
  }, [bottles, setValueLog]);

  // CRUD
  const handleSave = useCallback((bottle: Bottle) => {
    setBottles(prev => {
      const idx = prev.findIndex(b => b.id === bottle.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = bottle;
        return copy;
      }
      return [...prev, bottle];
    });
    setEditBottle(null);
  }, [setBottles]);

  const handleDelete = useCallback((id: string) => {
    setBottles(prev => prev.filter(b => b.id !== id));
  }, [setBottles]);

  const handleFinish = useCallback((id: string, drankOn: string, note: string, removeAll: boolean) => {
    setBottles(prev => prev.map(b => {
      if (b.id !== id) return b;
      const newNote = note ? `${b.tastingNotes ? b.tastingNotes + "\n" : ""}[${new Date(drankOn).toLocaleDateString()}] ${note}` : b.tastingNotes;
      if (removeAll || b.quantity <= 1) {
        return { ...b, isFinished: true, drankOn, quantity: 0, tastingNotes: newNote };
      }
      return { ...b, quantity: b.quantity - 1, tastingNotes: newNote };
    }));
  }, [setBottles]);

  const handleAddNote = useCallback((bottle: Bottle) => {
    setEditBottle(bottle);
    setFormOpen(true);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setSettings(prev => ({ ...prev, dismissedAlerts: [...prev.dismissedAlerts, id] }));
  }, [setSettings]);

  // Filter logic
  const filtered = useMemo(() => {
    let list = bottles;
    if (!showFinished) list = list.filter(b => !b.isFinished);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q) || b.tastingNotes.toLowerCase().includes(q));
    }
    if (selectedTypes.length) list = list.filter(b => selectedTypes.includes(b.type));
    if (ratingFilter !== "all") {
      if (ratingFilter === "90") list = list.filter(b => b.rating >= 90);
      else if (ratingFilter === "80") list = list.filter(b => b.rating >= 80 && b.rating < 90);
      else if (ratingFilter === "70") list = list.filter(b => b.rating >= 70 && b.rating < 80);
      else list = list.filter(b => b.rating < 70);
    }
    // Sort
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "vintage": return b.vintage - a.vintage;
        case "rating": return b.rating - a.rating;
        case "pricePaid": return b.pricePaid - a.pricePaid;
        case "quantity": return b.quantity - a.quantity;
        default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });
    return list;
  }, [bottles, search, selectedTypes, ratingFilter, sortBy, showFinished]);

  const toggleType = useCallback((t: BottleType) => {
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }, []);

  const handleRandomPick = useCallback(() => {
    const active = bottles.filter(b => !b.isFinished);
    if (!active.length) return;
    const pick = active[Math.floor(Math.random() * active.length)];
    setHighlightedId(pick.id);
    toast.info(`🎲 Tonight's pick: ${pick.name} (${pick.vintage})`);
    setTimeout(() => setHighlightedId(null), 5000);
  }, [bottles]);

  const handleFilterExpiring = useCallback(() => {
    setShowFinished(false);
    setSearch("");
    setSelectedTypes([]);
    setRatingFilter("all");
    setSortBy("dateAdded");
    // Trick: we'll just toast and let users see the alerts
    toast.info("Showing bottles with drink-by alerts");
  }, []);

  const activeCount = bottles.filter(b => !b.isFinished).length;

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar
        theme={settings.theme}
        onToggleTheme={toggleTheme}
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === "grid" ? "list" : "grid")}
        onOpenStats={() => setStatsOpen(true)}
        onRandomPick={handleRandomPick}
        hasBottles={activeCount > 0}
      />

      <DrinkByAlerts
        bottles={bottles}
        dismissedAlerts={settings.dismissedAlerts}
        onDismiss={dismissAlert}
        onFilterExpiring={handleFilterExpiring}
      />

      {activeCount === 0 && !showFinished ? (
        <EmptyState onAdd={() => setFormOpen(true)} />
      ) : (
        <div className="mx-auto max-w-7xl px-4 pb-24">
          <div className="py-4">
            <StatsHeader bottles={bottles} />
          </div>

          <FilterBar
            search={search} onSearchChange={setSearch}
            selectedTypes={selectedTypes} onToggleType={toggleType}
            ratingFilter={ratingFilter} onRatingFilterChange={setRatingFilter}
            sortBy={sortBy} onSortChange={setSortBy}
            showFinished={showFinished} onToggleFinished={() => setShowFinished(v => !v)}
            resultCount={filtered.length} totalCount={bottles.filter(b => showFinished || !b.isFinished).length}
          />

          <div className={`py-6 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}`}>
            <AnimatePresence>
              {filtered.map(b => (
                <BottleCard
                  key={b.id}
                  bottle={b}
                  onEdit={b => { setEditBottle(b); setFormOpen(true); }}
                  onAddNote={handleAddNote}
                  onFinish={b => setFinishBottle(b)}
                  highlighted={highlightedId === b.id}
                />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No bottles match your filters.</p>
          )}

        </div>
      )}

      {/* Fixed bottom buttons */}
      <div className="fixed bottom-6 left-6 z-50">
        {activeCount > 0 && (
          <Button
            onClick={() => setValueOpen(true)}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-primary/30 bg-card shadow-lg"
            aria-label="Open cellar value panel"
          >
            <DollarSign className="h-5 w-5 text-primary" />
          </Button>
        )}
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => { setEditBottle(null); setFormOpen(true); }}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl animate-pulse-gold hover:bg-primary/90"
          aria-label="Add bottle"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>



      {/* Modals & Panels */}
      <BottleForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBottle(null); }}
        onSave={handleSave}
        onDelete={handleDelete}
        editBottle={editBottle}
      />

      <FinishBottleModal
        open={!!finishBottle}
        onClose={() => setFinishBottle(null)}
        bottle={finishBottle}
        onFinish={handleFinish}
      />

      <AnalyticsPanel open={statsOpen} onClose={() => setStatsOpen(false)} bottles={bottles} valueLog={valueLog} />
      <CellarValuePanel open={valueOpen} onClose={() => setValueOpen(false)} bottles={bottles} />
    </div>
  );
};

export default Index;
