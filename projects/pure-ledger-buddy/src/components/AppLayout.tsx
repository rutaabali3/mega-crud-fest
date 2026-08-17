import { useState } from "react";
import { SidebarNav } from "@/components/SidebarNav";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { useTransactions } from "@/hooks/useTransactions";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Reports from "@/pages/Reports";

const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const txns = useTransactions();

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard {...txns} onNavigate={setCurrentPage} />;
      case "transactions":
        return <Transactions {...txns} />;
      case "reports":
        return <Reports transactions={txns.transactions} />;
      default:
        return <Dashboard {...txns} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 min-h-screen pb-20 md:pb-0">
        <MobileHeader />
        <div className="p-4 md:p-8 max-w-6xl mx-auto">{renderPage()}</div>
      </main>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default AppLayout;
