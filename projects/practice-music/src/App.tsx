import { useState, useEffect, useCallback } from 'react';
import { Home as HomeIcon, Music, CalendarDays, BarChart3, Target, Settings as SettingsIcon } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { loadSeedData } from './utils/seedData';
import { getPieces, getSessions, getGoals, getSettings, savePieces, saveSessions, saveGoals, saveSettings } from './utils/storage';
import type { Piece, Session, Goal, Settings } from './utils/storage';
import { AppSidebar } from './components/AppSidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './views/Dashboard';
import { PiecesView } from './views/PiecesView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { GoalsView } from './views/GoalsView';
import { SettingsView } from './views/SettingsView';
import { LogSessionModal } from './modals/LogSessionModal';
import { Metronome } from './components/Metronome';

export type ViewName = 'dashboard' | 'pieces' | 'calendar' | 'analytics' | 'goals' | 'settings';

const App = () => {
  const [view, setView] = useState<ViewName>('dashboard');
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [showLogSession, setShowLogSession] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadSeedData();
    setPieces(getPieces());
    setSessions(getSessions());
    setGoals(getGoals());
    setSettings(getSettings());
  }, []);

  const refreshData = useCallback(() => {
    setPieces(getPieces());
    setSessions(getSessions());
    setGoals(getGoals());
    setSettings(getSettings());
  }, []);

  const updatePieces = useCallback((p: Piece[]) => {
    savePieces(p);
    setPieces(p);
  }, []);

  const updateSessions = useCallback((s: Session[]) => {
    saveSessions(s);
    setSessions(s);
  }, []);

  const updateGoals = useCallback((g: Goal[]) => {
    saveGoals(g);
    setGoals(g);
  }, []);

  const updateSettings = useCallback((s: Settings) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  const viewTitles: Record<ViewName, string> = {
    dashboard: 'Dashboard',
    pieces: 'My Pieces',
    calendar: 'Calendar',
    analytics: 'Analytics',
    goals: 'Weekly Goals',
    settings: 'Settings',
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard pieces={pieces} sessions={sessions} settings={settings} onLogSession={() => setShowLogSession(true)} onNavigate={setView} />;
      case 'pieces':
        return <PiecesView pieces={pieces} sessions={sessions} onUpdatePieces={updatePieces} onUpdateSessions={updateSessions} onLogSession={() => setShowLogSession(true)} />;
      case 'calendar':
        return <CalendarView sessions={sessions} pieces={pieces} />;
      case 'analytics':
        return <AnalyticsView pieces={pieces} sessions={sessions} settings={settings} />;
      case 'goals':
        return <GoalsView goals={goals} sessions={sessions} settings={settings} onUpdateGoals={updateGoals} onUpdateSettings={updateSettings} />;
      case 'settings':
        return <SettingsView settings={settings} onUpdateSettings={updateSettings} onRefreshData={refreshData} />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          activeView={view}
          onNavigate={setView}
          sessions={sessions}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar
            title={viewTitles[view]}
            onLogSession={() => setShowLogSession(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {renderView()}
          </main>
        </div>
        <Metronome settings={settings} onUpdateSettings={updateSettings} />
        {/* Mobile bottom nav */}
        <MobileNav activeView={view} onNavigate={setView} />
      </div>
      {showLogSession && (
        <LogSessionModal
          pieces={pieces}
          onClose={() => setShowLogSession(false)}
          onSave={(session) => {
            const newSessions = [...sessions, session];
            updateSessions(newSessions);
            // Update piece BPM if improved
            const piece = pieces.find(p => p.id === session.pieceId);
            if (piece && session.bpmReached > piece.currentBPM) {
              const updated = pieces.map(p =>
                p.id === session.pieceId
                  ? {
                      ...p,
                      currentBPM: session.bpmReached,
                      ...(session.bpmReached >= p.targetBPM ? { status: 'mastered' as const, dateMastered: new Date().toISOString() } : {}),
                    }
                  : p
              );
              updatePieces(updated);
            }
            setShowLogSession(false);
          }}
          defaultInstrument={settings.defaultInstrument}
        />
      )}
    </TooltipProvider>
  );
};

function MobileNav({ activeView, onNavigate }: { activeView: ViewName; onNavigate: (v: ViewName) => void }) {
  const items: { view: ViewName; icon: typeof HomeIcon; label: string }[] = [
    { view: 'dashboard', icon: HomeIcon, label: 'Home' },
    { view: 'pieces', icon: Music, label: 'Pieces' },
    { view: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { view: 'analytics', icon: BarChart3, label: 'Stats' },
    { view: 'goals', icon: Target, label: 'Goals' },
    { view: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-card border-t border-border">
      {items.map(({ view, icon: Icon, label }) => (
        <button
          key={view}
          onClick={() => onNavigate(view)}
          className={`flex-1 flex flex-col items-center py-2 text-[10px] transition-colors ${activeView === view ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default App;
