import { ReactNode, useState } from "react";
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, Settings, Trash2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type Tab = "dashboard" | "inventory" | "add" | "shopping";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "add", label: "Add Item", icon: PlusCircle },
  { id: "shopping", label: "Shopping", icon: ShoppingCart },
];

interface AppLayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onClearAll: () => void;
  children: ReactNode;
}

export function AppLayout({ activeTab, onTabChange, onClearAll, children }: AppLayoutProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r bg-sidebar p-4 gap-2">
        <div className="flex items-center gap-2 px-2 mb-6">
          <Package className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">PantryPal</h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={activeTab === t.id ? "secondary" : "ghost"}
              className={cn(
                "justify-start gap-3 text-sm font-medium",
                activeTab === t.id && "bg-primary/10 text-primary"
              )}
              onClick={() => onTabChange(t.id)}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2 mt-auto pt-4 border-t">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold">PantryPal</h1>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex z-50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors",
              activeTab === t.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </nav>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all pantry data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onClearAll();
                setShowClearDialog(false);
              }}
            >
              Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
