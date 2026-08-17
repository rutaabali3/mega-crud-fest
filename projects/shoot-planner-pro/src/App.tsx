import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ShootsProvider } from "@/hooks/use-shoots-context";
import Index from "./pages/Index";
import ShootsList from "./pages/ShootsList";
import ShootDetail from "./pages/ShootDetail";
import CalendarView from "./pages/CalendarView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/shoot-planner-pro">
        <ShootsProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shoots" element={<ShootsList />} />
              <Route path="/shoots/:id" element={<ShootDetail />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </ShootsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
