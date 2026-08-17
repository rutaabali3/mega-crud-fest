import { Brain, Layers, ClipboardList, Trophy, BarChart3 } from 'lucide-react';
import type { AppView } from '@/types/flashcard';

const tabs: { id: AppView; label: string; icon: React.ReactNode }[] = [
  { id: 'decks', label: 'Decks', icon: <Layers className="w-4 h-4" /> },
  { id: 'review-queue', label: 'Review Queue', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'quiz-mode', label: 'Quiz Mode', icon: <Trophy className="w-4 h-4" /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
];

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  dueCount: number;
}

export default function Navbar({ activeView, onNavigate, dueCount }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <button onClick={() => onNavigate('decks')} className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">FlashForge</span>
          </button>

          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === tab.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === 'review-queue' && dueCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {dueCount}
                  </span>
                )}
                {activeView === tab.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
