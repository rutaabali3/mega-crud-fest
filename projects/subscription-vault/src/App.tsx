import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Subscriptions from "./pages/Subscriptions";
import CalendarPage from "./pages/CalendarPage";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppInner() {
  const { addSubscription } = useSubscriptions();
  const [quickAdd, setQuickAdd] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setQuickAdd(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SubscriptionForm open={quickAdd} onClose={() => setQuickAdd(false)} onSave={addSubscription} />
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/subscription-vault">
        <AppInner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
