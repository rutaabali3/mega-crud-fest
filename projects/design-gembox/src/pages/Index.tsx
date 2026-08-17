import { useState, useMemo, useCallback } from "react";
import { useAssets } from "@/hooks/useAssets";
import { useTheme } from "@/hooks/useTheme";
import { Asset, AssetType } from "@/types/asset";
import { Navbar } from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { AssetCard } from "@/components/AssetCard";
import { AssetModal } from "@/components/AssetModal";
import { DeleteModal } from "@/components/DeleteModal";
import { PalettePreview } from "@/components/PalettePreview";
import { toast } from "@/hooks/use-toast";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type Filter = { kind: "all" } | { kind: "type"; value: AssetType } | { kind: "project"; value: string };

export default function Index() {
  const { assets, addAsset, updateAsset, deleteAsset, deleteProjectAssets, projects, typeCounts } = useAssets();
  const { dark, toggle: toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  const debouncedSearch = useMemo(() => search.toLowerCase().trim(), [search]);

  const filteredAssets = useMemo(() => {
    let result = assets;
    if (filter.kind === "type") result = result.filter(a => a.type === filter.value);
    if (filter.kind === "project") result = result.filter(a => a.project === filter.value);
    if (debouncedSearch) {
      result = result.filter(a =>
        a.name.toLowerCase().includes(debouncedSearch) ||
        a.project.toLowerCase().includes(debouncedSearch) ||
        a.tags.some(t => t.toLowerCase().includes(debouncedSearch))
      );
    }
    return result;
  }, [assets, filter, debouncedSearch]);

  const handleAddAsset = useCallback(() => { setEditingAsset(null); setAssetModalOpen(true); }, []);
  const handleEditAsset = useCallback((asset: Asset) => { setEditingAsset(asset); setAssetModalOpen(true); }, []);

  const handleSaveAsset = useCallback((data: Omit<Asset, "id" | "createdAt" | "updatedAt">) => {
    addAsset(data);
    toast({ title: "Asset added!", description: `"${data.name}" has been created.` });
  }, [addAsset]);

  const handleUpdateAsset = useCallback((id: string, data: Partial<Asset>) => {
    updateAsset(id, data);
    toast({ title: "Asset updated!", description: "Changes saved." });
  }, [updateAsset]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteAsset(deleteTarget.id);
      toast({ title: "Asset deleted!", description: `"${deleteTarget.name}" removed.` });
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteAsset]);

  const handleDeleteProject = useCallback((name: string) => {
    setDeleteProjectTarget(name);
  }, []);

  const handleConfirmDeleteProject = useCallback(() => {
    if (deleteProjectTarget) {
      deleteProjectAssets(deleteProjectTarget);
      toast({ title: "Project deleted!", description: `All assets in "${deleteProjectTarget}" removed.` });
      setFilter({ kind: "all" });
      setDeleteProjectTarget(null);
    }
  }, [deleteProjectTarget, deleteProjectAssets]);

  const projectNames = useMemo(() => projects.map(p => p.name), [projects]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        search={search} onSearchChange={setSearch}
        viewMode={viewMode} onViewModeChange={setViewMode}
        onAddAsset={handleAddAsset}
        onPalettePreview={() => setPaletteOpen(true)}
        dark={dark} onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          totalCount={assets.length}
          typeCounts={typeCounts}
          projects={projects}
          activeFilter={filter}
          onFilter={setFilter}
          onNewProject={() => { setEditingAsset(null); setAssetModalOpen(true); }}
          onDeleteProject={handleDeleteProject}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <PackageOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No assets found</h2>
              <p className="text-muted-foreground mb-4">
                {debouncedSearch ? "Try a different search term." : "Get started by adding your first design asset."}
              </p>
              {!debouncedSearch && (
                <Button onClick={handleAddAsset}>Add Your First Asset</Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map(a => (
                <AssetCard key={a.id} asset={a} viewMode="grid" onEdit={handleEditAsset} onDelete={setDeleteTarget} />
              ))}
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              {filteredAssets.map(a => (
                <AssetCard key={a.id} asset={a} viewMode="list" onEdit={handleEditAsset} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </main>
      </div>

      <AssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onSave={handleSaveAsset}
        onUpdate={handleUpdateAsset}
        editingAsset={editingAsset}
        existingProjects={projectNames}
      />
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.name || ""}
      />
      <DeleteModal
        open={!!deleteProjectTarget}
        onClose={() => setDeleteProjectTarget(null)}
        onConfirm={handleConfirmDeleteProject}
        title={`project "${deleteProjectTarget}"`}
        description={`All assets in "${deleteProjectTarget}" will be permanently deleted. This cannot be undone.`}
      />
      <PalettePreview open={paletteOpen} onClose={() => setPaletteOpen(false)} assets={assets} />
    </div>
  );
}
