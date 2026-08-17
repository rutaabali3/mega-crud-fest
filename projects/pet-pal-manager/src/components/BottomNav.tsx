import { Home, PawPrint, Heart, Utensils, Scale, Pill } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Pets', url: '/pets', icon: PawPrint },
  { title: 'Health', url: '/health', icon: Heart },
  { title: 'Feeding', url: '/feeding', icon: Utensils },
  { title: 'Weight', url: '/weight', icon: Scale },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-1 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === '/'}
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground transition-colors text-xs"
            activeClassName="text-primary font-semibold"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
