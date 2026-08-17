import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { MediaSidebar } from "@/components/MediaSidebar";
import { TopBar } from "@/components/TopBar";
import { MediaCard } from "@/components/MediaCard";
import { AddEditModal } from "@/components/AddEditModal";
import { DetailModal } from "@/components/DetailModal";
import { EmptyState } from "@/components/EmptyState";
import { MediaItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const lib = useMediaLibrary();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("mediavault-dark");
    return saved !== null ? saved === "true" : true;
  });
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("mediavault-dark", String(darkMode));
  }, [darkMode]);

  // Keep detailItem in sync with library state
  useEffect(() => {
    if (detailItem) {
      const updated = lib.items.find(i => i.id === detailItem.id);
      if (updated) setDetailItem(updated);
      else setDetailItem(null);
    }
  }, [lib.items]);

  const handleSave = (data: Omit<MediaItem, "id" | "dateAdded">) => {
    if (editItem) {
      lib.updateItem(editItem.id, data);
      toast({ title: "Updated!", description: `${data.title} saved.` });
    } else {
      lib.addItem(data);
      toast({ title: "Added!", description: `${data.title} added to your vault.` });
    }
    setEditItem(null);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MediaSidebar statusFilter={lib.statusFilter} typeFilter={lib.typeFilter}
        onStatusFilter={lib.setStatusFilter} onTypeFilter={lib.setTypeFilter} stats={lib.stats} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar search={lib.search} onSearch={lib.setSearch} onAddNew={() => { setEditItem(null); setAddOpen(true); }}
          items={lib.items} onImport={lib.replaceAll} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)}
          statusFilter={lib.statusFilter} typeFilter={lib.typeFilter}
          onStatusFilter={lib.setStatusFilter} onTypeFilter={lib.setTypeFilter} stats={lib.stats} />

        <main className="flex-1 p-4 lg:p-6">
          {lib.filtered.length === 0 ? (
            <EmptyState onAdd={() => { setEditItem(null); setAddOpen(true); }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {lib.filtered.map(item => (
                  <MediaCard key={item.id} item={item} onClick={() => setDetailItem(item)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <AddEditModal open={addOpen || !!editItem} onClose={() => { setAddOpen(false); setEditItem(null); }}
        onSave={handleSave} editItem={editItem} />

      <DetailModal item={detailItem} open={!!detailItem} onClose={() => setDetailItem(null)}
        onUpdate={lib.updateItem} onDelete={lib.deleteItem} onMarkFinished={lib.markFinished} />
    </div>
  );
};

export default Index;
