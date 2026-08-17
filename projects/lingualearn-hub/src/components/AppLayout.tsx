import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { useVocab } from "@/hooks/useVocab";
import { useDarkMode } from "@/hooks/useDarkMode";
import { VocabContext } from "@/lib/VocabContext";

export function AppLayout() {
  const vocab = useVocab();
  useDarkMode(vocab.settings.darkMode);

  return (
    <VocabContext.Provider value={vocab}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center border-b px-4 bg-card shrink-0 md:flex hidden">
              <SidebarTrigger className="mr-3" />
              <h1 className="text-lg font-bold text-primary">VocabBank</h1>
            </header>
            <main className="flex-1 overflow-auto pb-20 md:pb-0">
              <Outlet />
            </main>
            <MobileNav />
          </div>
        </div>
      </SidebarProvider>
    </VocabContext.Provider>
  );
}
