import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Medication, DoseLog } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
  medications: Medication[];
  logs: DoseLog[];
}

export function AppLayout({ children, medications, logs }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar medications={medications} logs={logs} />
          <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
