import { useState, useMemo, useEffect } from "react";
import { Plus, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { ItemCard } from "@/components/ItemCard";
import { AddEditModal } from "@/components/AddEditModal";
import { FilterSidebar } from "@/components/FilterSidebar";
import { BudgetModal } from "@/components/BudgetModal";
import { ShareModal, parseSharedWishlist } from "@/components/ShareModal";
import { EmptyState } from "@/components/EmptyState";
import { useWishlist, useFilteredItems } from "@/hooks/useWishlist";
import { useThemeEffect } from "@/hooks/useTheme";
import type { WishItem, SortOption, StatusFilter, Priority } from "@/types/wishlist";

export default function Index() {
  const {
    items, people, budgets, viewMode, setViewMode,
    theme, setTheme, addItem, updateItem, deleteItem,
    clearPurchased, setBudget, setItems,
  } = useWishlist();

  useThemeEffect(theme);

  // Shared wishlist detection
  const [sharedItems, setSharedItems] = useState<WishItem[] | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const shared = parseSharedWishlist();
    if (shared) {
      setSharedItems(shared);
      setIsReadOnly(true);
    }
  }, []);

  const displayItems = isReadOnly ? (sharedItems || []) : items;

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("all");
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const maxPrice = useMemo(
    () => Math.max(1, ...displayItems.map((i) => i.price)),
    [displayItems]
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 99999]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filteredItems = useFilteredItems(displayItems, {
    search, person: selectedPerson, occasion: selectedOccasion,
    status, priority, priceRange, sort,
  });

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    displayItems.forEach((i) => {
      counts[i.forPerson] = (counts[i.forPerson] || 0) + 1;
    });
    return counts;
  }, [displayItems]);

  const purchasedCount = useMemo(
    () => displayItems.filter((i) => i.purchased).length,
    [displayItems]
  );

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<WishItem | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<WishItem | null>(null);
  const [claimModal, setClaimModal] = useState<WishItem | null>(null);
  const [claimName, setClaimName] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleSave = (data: Partial<WishItem>) => {
    if (data.id) {
      updateItem(data.id, data);
      toast.success("✅ Updated!");
    } else {
      addItem(data as Omit<WishItem, "id" | "createdAt" | "updatedAt" | "claimed" | "purchased">);
      toast.success("✨ Wish added!");
    }
  };

  const handleDelete = (item: WishItem) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteItem(deleteConfirm.id);
      toast.success("🗑️ Item removed");
      setDeleteConfirm(null);
    }
  };

  const handleClaim = (item: WishItem) => {
    if (isReadOnly) {
      setClaimModal(item);
    } else {
      updateItem(item.id, { claimed: true });
      toast.success("✅ Marked as claimed!");
    }
  };

  const confirmClaim = () => {
    if (claimModal && claimName.trim()) {
      if (isReadOnly && sharedItems) {
        setSharedItems(
          sharedItems.map((i) =>
            i.id === claimModal.id ? { ...i, claimed: true, claimedBy: claimName.trim() } : i
          )
        );
      } else {
        updateItem(claimModal.id, { claimed: true, claimedBy: claimName.trim() });
      }
      toast.success(`✅ Claimed by ${claimName.trim()}!`);
      setClaimModal(null);
      setClaimName("");
    }
  };

  const handlePurchase = (item: WishItem) => {
    updateItem(item.id, { purchased: true, claimed: true });
    toast.success("🛍️ Marked as purchased!");
  };

  const handleClearPurchased = () => {
    setClearConfirm(true);
  };

  const confirmClearPurchased = () => {
    clearPurchased();
    toast.success(`🗑️ Cleared ${purchasedCount} purchased items`);
    setClearConfirm(false);
  };

  const displayPeople = isReadOnly
    ? [...new Set((sharedItems || []).map((i) => i.forPerson))]
    : people;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onOpenBudget={() => setBudgetOpen(true)}
        onOpenShare={() => setShareOpen(true)}
      />

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="bg-primary/10 border-b px-4 py-2 text-center text-sm">
          👀 You're viewing a shared wishlist — <strong>Read Only</strong>
          <Button
            variant="link"
            size="sm"
            className="ml-2"
            onClick={() => {
              window.location.hash = "";
              setIsReadOnly(false);
              setSharedItems(null);
            }}
          >
            View my wishlist
          </Button>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-72 shrink-0 border-r bg-card min-h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
          <FilterSidebar
            search={search}
            onSearchChange={setSearch}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            people={displayPeople}
            selectedPerson={selectedPerson}
            onPersonChange={setSelectedPerson}
            selectedOccasion={selectedOccasion}
            onOccasionChange={setSelectedOccasion}
            status={status}
            onStatusChange={setStatus}
            priority={priority}
            onPriorityChange={setPriority}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            maxPrice={maxPrice}
            sort={sort}
            onSortChange={setSort}
            purchasedCount={purchasedCount}
            onClearPurchased={handleClearPurchased}
            itemCounts={itemCounts}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Mobile filter toggle */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {displayItems.length === 0 && !isReadOnly ? (
            <EmptyState onAdd={() => setAddModalOpen(true)} />
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No items match your filters</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  readOnly={isReadOnly}
                  onEdit={(i) => setEditItem(i)}
                  onDelete={handleDelete}
                  onClaim={handleClaim}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* FAB */}
      {!isReadOnly && (
        <button
          onClick={() => setAddModalOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          aria-label="Add wish"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Mobile filters sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-card animate-slide-in-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              search={search}
              onSearchChange={setSearch}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              people={displayPeople}
              selectedPerson={selectedPerson}
              onPersonChange={setSelectedPerson}
              selectedOccasion={selectedOccasion}
              onOccasionChange={setSelectedOccasion}
              status={status}
              onStatusChange={setStatus}
              priority={priority}
              onPriorityChange={setPriority}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={maxPrice}
              sort={sort}
              onSortChange={setSort}
              purchasedCount={purchasedCount}
              onClearPurchased={handleClearPurchased}
              itemCounts={itemCounts}
            />
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditModal
        open={addModalOpen || !!editItem}
        onClose={() => { setAddModalOpen(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
        people={people}
      />

      {/* Budget Modal */}
      <BudgetModal
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        items={displayItems}
        people={displayPeople}
        budgets={budgets}
        onSetBudget={setBudget}
      />

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        items={items}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove item?</DialogTitle>
            <DialogDescription>
              Remove "{deleteConfirm?.name}" from your wishlist?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, Remove</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Purchased Confirmation */}
      <Dialog open={clearConfirm} onOpenChange={(o) => !o && setClearConfirm(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear purchased items?</DialogTitle>
            <DialogDescription>
              This will remove {purchasedCount} purchased items from your wishlist.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setClearConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmClearPurchased}>Clear All</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claim Modal (read-only) */}
      <Dialog open={!!claimModal} onOpenChange={(o) => !o && setClaimModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Claim this item</DialogTitle>
            <DialogDescription>
              Let others know you're getting "{claimModal?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={claimName}
              onChange={(e) => setClaimName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setClaimModal(null)}>Cancel</Button>
              <Button onClick={confirmClaim} disabled={!claimName.trim()}>Claim</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
