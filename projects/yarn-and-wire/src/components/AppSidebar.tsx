import {
  LayoutGrid, Image, Package, Calculator, Archive, Moon, Sun,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useCraft } from "@/context/CraftContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "WIP Board", url: "/", icon: LayoutGrid, emoji: "🧶" },
  { title: "Completed", url: "/gallery", icon: Image, emoji: "🖼️" },
  { title: "Materials", url: "/inventory", icon: Package, emoji: "📦" },
  { title: "Cost Calc", url: "/calculator", icon: Calculator, emoji: "💰" },
  { title: "Archived", url: "/archive", icon: Archive, emoji: "📁" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { darkMode, setDarkMode } = useCraft();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-sm">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.url)
                    }
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <span className="text-base mr-1">{item.emoji}</span>
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
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={() => setDarkMode(!darkMode)}
          className="w-full justify-start gap-2"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && (darkMode ? "Light Mode" : "Dark Mode")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
