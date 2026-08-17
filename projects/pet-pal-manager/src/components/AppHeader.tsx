import { Search, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { usePetCare } from '@/contexts/PetCareContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  const { theme, toggle } = useTheme();
  const { searchQuery, setSearchQuery } = usePetCare();

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 h-14 px-4">
        <SidebarTrigger className="hidden md:flex" />
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pets, records..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-muted border-0"
          />
        </div>
        <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
