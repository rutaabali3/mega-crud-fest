import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useMedications } from "@/hooks/useMedications";
import { useLogs } from "@/hooks/useLogs";
import { useSymptoms } from "@/hooks/useSymptoms";
import { useSeedData } from "@/hooks/useSeedData";
import DashboardPage from "@/pages/DashboardPage";
import MedicationsPage from "@/pages/MedicationsPage";
import SchedulePage from "@/pages/SchedulePage";
import CalendarPage from "@/pages/CalendarPage";
import SymptomsPage from "@/pages/SymptomsPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useSeedData();
  const { medications, addMedication, updateMedication, deleteMedication } = useMedications();
  const { logs, markTaken, markSkipped, deleteLogsForMedication } = useLogs();
  const { symptoms, addSymptom, updateSymptom, deleteSymptom } = useSymptoms();

  const handleDeleteMed = (id: string) => {
    deleteMedication(id);
    deleteLogsForMedication(id);
  };

  return (
    <AppLayout medications={medications} logs={logs}>
      <Routes>
        <Route path="/" element={
          <DashboardPage medications={medications} logs={logs} symptoms={symptoms} onMarkTaken={markTaken} onMarkSkipped={markSkipped} />
        } />
        <Route path="/medications" element={
          <MedicationsPage medications={medications} onAdd={addMedication} onUpdate={updateMedication} onDelete={handleDeleteMed} />
        } />
        <Route path="/schedule" element={
          <SchedulePage medications={medications} logs={logs} onMarkTaken={markTaken} onMarkSkipped={markSkipped} />
        } />
        <Route path="/calendar" element={
          <CalendarPage medications={medications} logs={logs} />
        } />
        <Route path="/symptoms" element={
          <SymptomsPage symptoms={symptoms} medications={medications} onAdd={addSymptom} onUpdate={updateSymptom} onDelete={deleteSymptom} />
        } />
        <Route path="/reports" element={
          <ReportsPage medications={medications} logs={logs} symptoms={symptoms} />
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/medilog-health-companion">
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
