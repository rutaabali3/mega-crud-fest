import {
  LayoutDashboard,
  Users,
  Compass,
  MessageCircle,
  Archive,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Council Chamber", url: "/council", icon: Compass },
  { title: "Advisors", url: "/advisors", icon: Users },
  { title: "New Meeting", url: "/meeting/new", icon: MessageCircle },
  { title: "Wisdom Archive", url: "/archive", icon: Archive },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-6">
        {!collapsed && (
          <div className="px-6 pb-6">
            <h1 className="font-serif text-xl font-bold text-foreground">
              Inner Council
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your personal advisory board
            </p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center pb-4">
            <span className="text-2xl">🏛️</span>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
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
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
