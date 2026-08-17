import React from "react";
import { Wrench, LayoutDashboard, ListTodo, Users, DollarSign, Sun, Moon } from "lucide-react";
import { ViewType } from "@/lib/types";

interface NavBarProps {
  currentView: ViewType;
  setView: (v: ViewType) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const tabs: { view: ViewType; label: string; icon: React.ReactNode }[] = [
  { view: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { view: "tasks", label: "Tasks", icon: <ListTodo size={18} /> },
  { view: "contractors", label: "Contractors", icon: <Users size={18} /> },
  { view: "costHistory", label: "Cost History", icon: <DollarSign size={18} /> },
];

export default function NavBar({ currentView, setView, darkMode, toggleDark }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wrench size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">HomeTrack</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {tabs.map((t) => (
            <button
              key={t.view}
              onClick={() => setView(t.view)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentView === t.view
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <button
          onClick={toggleDark}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
