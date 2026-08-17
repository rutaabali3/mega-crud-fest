import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 md:px-6">
            <SidebarTrigger className="hidden md:flex" />
            <h2 className="md:hidden font-serif text-lg font-semibold text-foreground">
              Inner Council
            </h2>
          </header>

          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>

        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
