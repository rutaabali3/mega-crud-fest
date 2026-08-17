import { Paintbrush, Type, Hexagon, ImageIcon, FolderOpen, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetType } from "@/types/asset";

interface SidebarProps {
  totalCount: number;
  typeCounts: Record<AssetType, number>;
  projects: { name: string; count: number }[];
  activeFilter: { kind: "all" } | { kind: "type"; value: AssetType } | { kind: "project"; value: string };
  onFilter: (filter: SidebarProps["activeFilter"]) => void;
  onNewProject: () => void;
  onDeleteProject: (name: string) => void;
  open: boolean;
  onClose: () => void;
}

const typeItems: { type: AssetType; label: string; icon: React.ElementType }[] = [
  { type: "color", label: "Colors", icon: Paintbrush },
  { type: "font", label: "Fonts", icon: Type },
  { type: "icon", label: "Icons", icon: Hexagon },
  { type: "image", label: "Images", icon: ImageIcon },
];

export function AppSidebar({
  totalCount, typeCounts, projects, activeFilter, onFilter,
  onNewProject, onDeleteProject, open, onClose,
}: SidebarProps) {
  const isActive = (filter: SidebarProps["activeFilter"]) => {
    if (filter.kind === "all" && activeFilter.kind === "all") return true;
    if (filter.kind === "type" && activeFilter.kind === "type" && filter.value === activeFilter.value) return true;
    if (filter.kind === "project" && activeFilter.kind === "project" && filter.value === activeFilter.value) return true;
    return false;
  };

  const handleClick = (filter: SidebarProps["activeFilter"]) => {
    onFilter(filter);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed md:relative z-50 md:z-0 top-0 left-0 h-full w-64 shrink-0
        bg-sidebar-background border-r border-sidebar-border
        flex flex-col overflow-y-auto
        transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 border-b border-sidebar-border md:hidden">
          <span className="font-bold text-lg">AssetVault</span>
        </div>

        <nav className="flex-1 p-3 space-y-6">
          {/* All Assets */}
          <div>
            <button
              onClick={() => handleClick({ kind: "all" })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive({ kind: "all" })
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Package className="h-4 w-4" />
              All Assets
              <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{totalCount}</span>
            </button>
          </div>

          {/* By Type */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground px-3 mb-2">By Type</h3>
            <div className="space-y-0.5">
              {typeItems.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => handleClick({ kind: "type", value: type })}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive({ kind: "type", value: type })
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{typeCounts[type]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* By Project */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground px-3 mb-2">By Project</h3>
            <div className="space-y-0.5">
              {projects.map(p => (
                <div key={p.name} className="group flex items-center">
                  <button
                    onClick={() => handleClick({ kind: "project", value: p.name })}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive({ kind: "project", value: p.name })
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{p.count}</span>
                  </button>
                  {isActive({ kind: "project", value: p.name }) && (
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteProject(p.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start text-muted-foreground" onClick={onNewProject}>
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
