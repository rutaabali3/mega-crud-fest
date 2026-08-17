import { Home, PawPrint, Heart, Utensils, Scale, Pill, Settings, Search, Moon, Sun } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { usePetCare } from '@/contexts/PetCareContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'My Pets', url: '/pets', icon: PawPrint },
  { title: 'Health', url: '/health', icon: Heart },
  { title: 'Feeding', url: '/feeding', icon: Utensils },
  { title: 'Weight', url: '/weight', icon: Scale },
  { title: 'Medications', url: '/medications', icon: Pill },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { theme, toggle } = useTheme();
  const { searchQuery, setSearchQuery } = usePetCare();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🐾</span>
            <span className="font-bold text-lg text-foreground">PetCare</span>
          </div>
        )}
        {collapsed && <span className="text-2xl block text-center">🐾</span>}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                activeClassName="bg-primary/10 text-primary font-semibold"
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={toggle} className="mt-2 mx-auto">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
