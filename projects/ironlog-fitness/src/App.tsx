import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import Dashboard from "@/pages/Dashboard";
import Programs from "@/pages/Programs";
import LogWorkout from "@/pages/LogWorkout";
import Progress from "@/pages/Progress";
import Measurements from "@/pages/Measurements";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/ironlog-fitness">
        <WorkoutProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full dark">
              <div className="hidden sm:block">
                <AppSidebar />
              </div>
              <div className="flex-1 flex flex-col min-h-screen">
                <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 pb-20 sm:pb-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/programs" element={<Programs />} />
                    <Route path="/log" element={<LogWorkout />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/measurements" element={<Measurements />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
            <BottomTabBar />
            <RestTimerOverlay />
          </SidebarProvider>
        </WorkoutProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
