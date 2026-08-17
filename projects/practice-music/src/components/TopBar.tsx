import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onLogSession: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopBar({ title, onLogSession, onToggleSidebar }: Props) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="hidden md:block text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-heading font-bold text-foreground">{title}</h1>
      </div>
      <Button
        onClick={onLogSession}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold gap-1.5 shadow-lg"
        size="sm"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">Log Session</span>
      </Button>
    </header>
  );
}
