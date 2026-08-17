import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Compass,
  MessageCircle,
  Archive,
} from "lucide-react";

const navItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Chamber", url: "/council", icon: Compass },
  { title: "Advisors", url: "/advisors", icon: Users },
  { title: "Meet", url: "/meeting/new", icon: MessageCircle },
  { title: "Archive", url: "/archive", icon: Archive },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
