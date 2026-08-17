import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { usePlants } from "@/hooks/usePlants";
import { Dashboard } from "@/pages/Dashboard";
import { Garden } from "@/pages/Garden";
import { PlantDetail } from "@/pages/PlantDetail";
import { Schedule } from "@/pages/Schedule";
import { RIPArchive } from "@/pages/RIPArchive";
import { SeasonalTips } from "@/pages/SeasonalTips";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const {
    plants, activePlants, archivedPlants,
    addPlant, updatePlant, deletePlant, archivePlant, restorePlant,
    addCareLog, deleteCareLog, addGrowthPhoto, deleteGrowthPhoto, importPlants,
  } = usePlants();

  const exportGarden = () => {
    const blob = new Blob([JSON.stringify(plants, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leafy-garden-backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importGarden = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      try { importPlants(JSON.parse(text)); } catch { /* ignore */ }
    };
    input.click();
  };

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard plants={plants} activePlants={activePlants} archivedPlants={archivedPlants} onAddPlant={addPlant} />} />
        <Route path="/garden" element={<Garden activePlants={activePlants} onAddPlant={addPlant} />} />
        <Route path="/plant/:id" element={
          <PlantDetail plants={plants} updatePlant={updatePlant} addCareLog={addCareLog}
            deleteCareLog={deleteCareLog} archivePlant={archivePlant} deletePlant={deletePlant}
            addGrowthPhoto={addGrowthPhoto} deleteGrowthPhoto={deleteGrowthPhoto} onSavePlant={addPlant} />
        } />
        <Route path="/schedule" element={<Schedule activePlants={activePlants} />} />
        <Route path="/archive" element={<RIPArchive archivedPlants={archivedPlants} restorePlant={restorePlant} deletePlant={deletePlant} />} />
        <Route path="/tips" element={<SeasonalTips activePlants={activePlants} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/plant-pal">
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
