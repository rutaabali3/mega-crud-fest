import { Home, Layers, Zap, TrendingUp, Ruler } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Programs", url: "/programs", icon: Layers },
  { title: "Log Workout", url: "/log", icon: Zap },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Measurements", url: "/measurements", icon: Ruler },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <Zap className="h-7 w-7 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            IRONLOG
          </span>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        } ${item.title === "Log Workout" && !isActive ? "text-primary" : ""}`}
                        activeClassName=""
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="font-semibold text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
