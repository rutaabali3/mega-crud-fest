import { LayoutDashboard, CreditCard, Calendar, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { title: 'Home', url: '/', icon: LayoutDashboard },
  { title: 'Subs', url: '/subscriptions', icon: CreditCard },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-white/10 rounded-none">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === '/'}
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
