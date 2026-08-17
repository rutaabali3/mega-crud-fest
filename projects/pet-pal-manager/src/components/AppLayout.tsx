import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
