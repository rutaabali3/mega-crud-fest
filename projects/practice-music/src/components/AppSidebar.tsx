import { Home, Music, CalendarDays, BarChart3, Target, Settings, Music2 } from 'lucide-react';
import type { ViewName } from '../App';
import type { Session } from '../utils/storage';
import { getThisWeekSessions } from '../utils/dateUtils';

interface Props {
  activeView: ViewName;
  onNavigate: (v: ViewName) => void;
  sessions: Session[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const navItems: { view: ViewName; icon: typeof Home; label: string }[] = [
  { view: 'dashboard', icon: Home, label: 'Dashboard' },
  { view: 'pieces', icon: Music, label: 'My Pieces' },
  { view: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { view: 'analytics', icon: BarChart3, label: 'Analytics' },
  { view: 'goals', icon: Target, label: 'Weekly Goals' },
  { view: 'settings', icon: Settings, label: 'Settings' },
];

export function AppSidebar({ activeView, onNavigate, sessions, sidebarOpen }: Props) {
  const weekSessions = getThisWeekSessions(sessions);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-surface transition-all duration-200 ${sidebarOpen ? 'w-60' : 'w-16'} shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <Music2 size={24} className="text-primary shrink-0" />
        {sidebarOpen && <span className="font-heading font-bold text-lg text-foreground">PracticeLog</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 space-y-1 px-2">
        {navItems.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeView === view
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Weekly stat */}
      {sidebarOpen && (
        <div className="mx-3 mb-4 p-3 rounded-lg bg-muted">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">This Week</p>
          <p className="text-xl font-heading font-bold text-foreground">{weekMinutes} <span className="text-xs font-sans text-muted-foreground">min</span></p>
        </div>
      )}
    </aside>
  );
}
