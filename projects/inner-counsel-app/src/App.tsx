import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CouncilChamber from "./pages/CouncilChamber";
import AdvisorsLibrary from "./pages/AdvisorsLibrary";
import CreateAdvisor from "./pages/CreateAdvisor";
import EditAdvisor from "./pages/EditAdvisor";
import NewMeeting from "./pages/NewMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import WisdomArchive from "./pages/WisdomArchive";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/inner-counsel-app">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/council" element={<CouncilChamber />} />
              <Route path="/advisors" element={<AdvisorsLibrary />} />
              <Route path="/advisors/new" element={<CreateAdvisor />} />
              <Route path="/advisors/:id/edit" element={<EditAdvisor />} />
              <Route path="/meeting/new" element={<NewMeeting />} />
              <Route path="/meeting/:id" element={<MeetingRoom />} />
              <Route path="/archive" element={<WisdomArchive />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
