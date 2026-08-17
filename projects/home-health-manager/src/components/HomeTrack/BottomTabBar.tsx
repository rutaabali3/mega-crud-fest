import React from "react";
import { LayoutDashboard, ListTodo, Users, DollarSign } from "lucide-react";
import { ViewType } from "@/lib/types";

interface BottomTabBarProps {
  currentView: ViewType;
  setView: (v: ViewType) => void;
}

const tabs: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { view: "tasks", label: "Tasks", icon: <ListTodo size={20} /> },
  { view: "contractors", label: "Contractors", icon: <Users size={20} /> },
  { view: "costHistory", label: "History", icon: <DollarSign size={20} /> },
];

export default function BottomTabBar({ currentView, setView }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((t) => (
          <button
            key={t.view}
            onClick={() => setView(t.view)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
              currentView === t.view ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
