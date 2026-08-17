import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDecisions } from "@/hooks/useDecisions";
import { useSettings } from "@/hooks/useSettings";
import { AppLayout } from "@/components/layout/AppLayout";
import { useMemo } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import Dashboard from "./pages/Dashboard";
import AllDecisions from "./pages/AllDecisions";
import CreateDecision from "./pages/CreateDecision";
import DecisionDetail from "./pages/DecisionDetail";
import TrashPage from "./pages/TrashPage";
import Insights from "./pages/Insights";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const {
    decisions, trashedDecisions, loading,
    addDecision, updateDecision, trashDecision,
    restoreDecision, permanentlyDelete, emptyTrash,
    importDecisions, exportDecisions, clearAll,
  } = useDecisions();
  const { settings, updateSettings } = useSettings();

  // Calculate streak
  const streak = useMemo(() => {
    const dates = new Set(
      [...decisions, ...trashedDecisions].map(d => format(new Date(d.dateCreated), "yyyy-MM-dd"))
    );
    let count = 0;
    let day = new Date();
    while (dates.has(format(day, "yyyy-MM-dd"))) {
      count++;
      day = new Date(day.getTime() - 86400000);
    }
    return count;
  }, [decisions, trashedDecisions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AppLayout streak={streak}>
      <Routes>
        <Route path="/" element={<Dashboard decisions={decisions} />} />
        <Route path="/decisions" element={<AllDecisions decisions={decisions} settings={settings} />} />
        <Route path="/create" element={
          <CreateDecision onSave={addDecision} />
        } />
        <Route path="/edit/:id" element={
          <EditDecisionWrapper decisions={decisions} onSave={(d) => updateDecision(d.id, d)} />
        } />
        <Route path="/decision/:id" element={
          <DecisionDetail decisions={decisions} onUpdate={updateDecision} onTrash={trashDecision} />
        } />
        <Route path="/trash" element={
          <TrashPage
            trashedDecisions={trashedDecisions}
            onRestore={restoreDecision}
            onPermanentlyDelete={permanentlyDelete}
            onEmptyTrash={emptyTrash}
          />
        } />
        <Route path="/insights" element={<Insights decisions={decisions} />} />
        <Route path="/settings" element={
          <SettingsPage
            settings={settings}
            onUpdateSettings={updateSettings}
            onExport={exportDecisions}
            onImport={importDecisions}
            onClearAll={clearAll}
          />
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function EditDecisionWrapper({ decisions, onSave }: { decisions: any[]; onSave: (d: any) => void }) {
  const id = window.location.pathname.split("/edit/")[1];
  const decision = decisions.find((d: any) => d.id === id);
  if (!decision) return <div className="text-center py-16 text-muted-foreground">Decision not found</div>;
  return <CreateDecision existingDecision={decision} onSave={onSave} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter basename="/decision-flow">
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
