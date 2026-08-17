import { Home, Layers, Zap, TrendingUp, Ruler } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { title: "Home", url: "/", icon: Home },
  { title: "Programs", url: "/programs", icon: Layers },
  { title: "Log", url: "/log", icon: Zap },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Body", url: "/measurements", icon: Ruler },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around py-2 sm:hidden">
      {tabs.map((tab) => {
        const isActive =
          tab.url === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.url);
        return (
          <Link
            key={tab.title}
            to={tab.url}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{tab.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
