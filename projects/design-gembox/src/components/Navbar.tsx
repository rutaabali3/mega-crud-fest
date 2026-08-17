import { Search, Plus, LayoutGrid, List, Palette, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (v: "grid" | "list") => void;
  onAddAsset: () => void;
  onPalettePreview: () => void;
  dark: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export function Navbar({
  search, onSearchChange, viewMode, onViewModeChange,
  onAddAsset, onPalettePreview, dark, onToggleTheme, onToggleSidebar,
}: NavbarProps) {
  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-4 shrink-0">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 mr-4">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">AV</span>
        </div>
        <span className="font-bold text-lg hidden sm:inline">AssetVault</span>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 h-9 bg-background"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon" onClick={onPalettePreview} title="Palette Preview">
          <Palette className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
          title={viewMode === "grid" ? "List view" : "Grid view"}
        >
          {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleTheme} title="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="sm" onClick={onAddAsset} className="ml-1">
          <Plus className="h-4 w-4 mr-1" /> Add Asset
        </Button>
      </div>
    </header>
  );
}
