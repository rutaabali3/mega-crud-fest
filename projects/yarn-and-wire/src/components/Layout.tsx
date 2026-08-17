import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { NewProjectModal } from "@/components/NewProjectModal";

export function Layout() {
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onNewProject={() => setShowNewProject(true)} />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 page-enter">
            <Outlet />
          </main>
        </div>
        <MobileNav onNewProject={() => setShowNewProject(true)} />
        <NewProjectModal open={showNewProject} onOpenChange={setShowNewProject} />
      </div>
    </SidebarProvider>
  );
}
