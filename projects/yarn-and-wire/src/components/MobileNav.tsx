import { LayoutGrid, Image, Package, Calculator, Archive, Plus } from "lucide-react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { url: "/", icon: LayoutGrid, label: "WIP" },
  { url: "/gallery", icon: Image, label: "Gallery" },
  { url: "/inventory", icon: Package, label: "Materials" },
  { url: "/calculator", icon: Calculator, label: "Costs" },
  { url: "/archive", icon: Archive, label: "Archive" },
];

interface MobileNavProps {
  onNewProject: () => void;
}

export function MobileNav({ onNewProject }: MobileNavProps) {
  const location = useLocation();

  return (
    <>
      {/* FAB */}
      <button
        onClick={onNewProject}
        className="fixed bottom-20 right-4 z-40 md:hidden h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>
      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const active =
              tab.url === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(tab.url);
            return (
              <RouterNavLink
                key={tab.url}
                to={tab.url}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 rounded-md transition-colors",
                  active ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </RouterNavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
