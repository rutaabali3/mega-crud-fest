import { useState, useRef } from "react";
import { useCinemaVault } from "@/hooks/useCinemaVault";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTitleModal } from "@/components/AddTitleModal";
import { DetailModal } from "@/components/DetailModal";
import { DashboardPage } from "@/pages/DashboardPage";
import { WatchlistPage } from "@/pages/WatchlistPage";
import { RandomPickPage } from "@/pages/RandomPickPage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LayoutDashboard, List, Play, Eye, Dice5, Plus, Download, Upload, Trash2, Search, Menu } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CinemaItem } from "@/types/cinema";

type Page = "dashboard" | "watchlist" | "watching" | "watched" | "random";

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "watchlist" as Page, label: "Watchlist", icon: List },
  { id: "watching" as Page, label: "Watching", icon: Play },
  { id: "watched" as Page, label: "Watched", icon: Eye },
  { id: "random" as Page, label: "Random Pick", icon: Dice5 },
];

const Index = () => {
  const vault = useCinemaVault();
  const [page, setPage] = useState<Page>("dashboard");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<CinemaItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleAdd = (data: Parameters<typeof vault.addItem>[0]) => {
    vault.addItem(data);
    toast({ title: "Added!", description: `"${data.title}" added to your vault.` });
  };

  const handleUpdate = (id: string, updates: Partial<CinemaItem>) => {
    vault.updateItem(id, updates);
    toast({ title: "Saved!", description: "Changes saved to localStorage." });
  };

  const handleDelete = (id: string) => {
    vault.deleteItem(id);
    toast({ title: "Deleted", description: "Title removed from vault." });
  };

  const handleCardClick = (item: CinemaItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = vault.importData(ev.target?.result as string);
      toast({ title: ok ? "Imported!" : "Error", description: ok ? "Data imported successfully." : "Invalid JSON file." });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage stats={vault.stats} />;
      case "watchlist": return <WatchlistPage items={vault.items} search={search} onCardClick={handleCardClick} title="Watchlist" emptyIcon="📋" emptyText="No titles yet. Add your first one!" />;
      case "watching": return <WatchlistPage items={vault.items} search={search} onCardClick={handleCardClick} filterStatus="Watching" title="Currently Watching" emptyIcon="▶️" emptyText="Nothing in progress. Start watching something!" />;
      case "watched": return <WatchlistPage items={vault.items} search={search} onCardClick={handleCardClick} filterStatus="Watched" title="Watched" emptyIcon="✅" emptyText="No titles watched yet." showAvg />;
      case "random": return <RandomPickPage getRandomPick={vault.getRandomPick} onUpdate={handleUpdate} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full cinema-gradient">
        <Sidebar collapsible="icon" className="border-r border-border">
          <SidebarContent className="pt-4">
            <div className="px-4 pb-4 flex items-center gap-2">
              <span className="text-xl font-bold text-primary">🎬</span>
              <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
                Cinema<span className="text-secondary">Vault</span>
              </span>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setPage(item.id)}
                        isActive={page === item.id}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 border-b border-border flex items-center gap-2 px-3 shrink-0">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search titles..."
                className="pl-9 bg-muted border-border h-9"
              />
            </div>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Title</span>
            </Button>
            <Button size="sm" variant="outline" onClick={vault.exportData} className="gap-1.5 shrink-0">
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => importRef.current?.click()} className="gap-1.5 shrink-0">
              <Upload className="h-4 w-4" /> <span className="hidden sm:inline">Import</span>
            </Button>
            <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-1.5 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all titles from your vault.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { vault.clearAll(); toast({ title: "Cleared", description: "All data has been removed." }); }} className="bg-destructive text-destructive-foreground">Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            {renderPage()}
          </main>
        </div>
      </div>

      <AddTitleModal open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
      <DetailModal item={detailItem} open={detailOpen} onOpenChange={setDetailOpen} onUpdate={handleUpdate} onDelete={handleDelete} />
    </SidebarProvider>
  );
};

export default Index;
