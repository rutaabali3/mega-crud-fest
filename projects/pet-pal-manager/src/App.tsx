import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PetCareProvider } from "@/contexts/PetCareContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import PetsPage from "./pages/PetsPage";
import PetDetail from "./pages/PetDetail";
import HealthPage from "./pages/HealthPage";
import FeedingPage from "./pages/FeedingPage";
import WeightPage from "./pages/WeightPage";
import MedicationsPage from "./pages/MedicationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/pet-pal-manager">
        <PetCareProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pets" element={<PetsPage />} />
              <Route path="/pets/:id" element={<PetDetail />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/feeding" element={<FeedingPage />} />
              <Route path="/weight" element={<WeightPage />} />
              <Route path="/medications" element={<MedicationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PetCareProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
