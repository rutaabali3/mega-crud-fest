import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Home, Flower2, Calendar, Skull, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/garden', label: 'Garden', icon: Flower2 },
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/archive', label: 'RIP', icon: Skull },
  { to: '/tips', label: 'Tips', icon: Sun },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { dark, toggle } = useTheme();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card/50 p-4 gap-2 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 mb-6">
          <span className="text-2xl">🌿</span>
          <h1 className="text-xl font-bold font-serif text-primary">Leafy</h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </RouterNavLink>
          ))}
        </nav>
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h1 className="text-lg font-bold font-serif text-primary">Leafy</h1>
          </div>
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-muted transition-colors">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 flex">
        {navItems.map(item => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors',
              location.pathname === item.to
                ? 'text-primary font-semibold'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </RouterNavLink>
        ))}
      </nav>
    </div>
  );
};
