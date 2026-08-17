import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CraftProvider } from "@/context/CraftContext";
import { Layout } from "@/components/Layout";
import WIPBoard from "@/pages/WIPBoard";
import CompletedGallery from "@/pages/CompletedGallery";
import MaterialsInventory from "@/pages/MaterialsInventory";
import CostCalculator from "@/pages/CostCalculator";
import ArchivePage from "@/pages/ArchivePage";
import ProjectDetail from "@/pages/ProjectDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CraftProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/yarn-and-wire">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<WIPBoard />} />
              <Route path="/gallery" element={<CompletedGallery />} />
              <Route path="/inventory" element={<MaterialsInventory />} />
              <Route path="/calculator" element={<CostCalculator />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CraftProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
