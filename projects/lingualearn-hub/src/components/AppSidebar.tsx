import { Book, RotateCcw, Target, BarChart3, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "My Vocabulary", url: "/", icon: Book, emoji: "📚" },
  { title: "Due for Review", url: "/review", icon: RotateCcw, emoji: "🔁" },
  { title: "Daily Quiz", url: "/quiz", icon: Target, emoji: "🎯" },
  { title: "Stats & Mastery", url: "/stats", icon: BarChart3, emoji: "📊" },
  { title: "Settings", url: "/settings", icon: Settings, emoji: "⚙️" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50 transition-default"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <span className="mr-2 text-base">{item.emoji}</span>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
