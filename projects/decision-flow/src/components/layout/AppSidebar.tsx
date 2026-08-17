import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, List, PlusCircle, Trash2,
  BarChart3, Settings, Flame, BookOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "All Decisions", url: "/decisions", icon: List },
  { title: "New Decision", url: "/create", icon: PlusCircle },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "Trash", url: "/trash", icon: Trash2 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ streak }: { streak: number }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-serif text-lg font-semibold gradient-text">Decision Journal</span>
              </div>
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && streak > 0 && (
          <div className="mt-auto px-4 pb-4">
            <div className="glass-card p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Flame className="h-5 w-5 text-warning" />
                <span>{streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
