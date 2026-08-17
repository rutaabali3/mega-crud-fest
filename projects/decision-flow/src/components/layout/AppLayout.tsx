import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, List, PlusCircle, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { url: "/", icon: LayoutDashboard },
  { url: "/decisions", icon: List },
  { url: "/create", icon: PlusCircle },
  { url: "/insights", icon: BarChart3 },
  { url: "/settings", icon: Settings },
];

export function AppLayout({ children, streak = 0 }: { children: React.ReactNode; streak?: number }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <AppSidebar streak={streak} />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 flex items-center border-b border-border px-4 md:px-6">
            <SidebarTrigger className="hidden md:flex" />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-md z-50">
            <div className="flex items-center justify-around h-14">
              {mobileNav.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
}
