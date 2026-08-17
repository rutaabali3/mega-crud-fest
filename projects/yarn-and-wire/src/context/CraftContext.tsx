import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { CraftProject, Material, Session } from "@/types/craft";
import { v4 as uuid } from "uuid";
import { toast } from "@/hooks/use-toast";

interface CraftState {
  projects: CraftProject[];
  hourlyRate: number;
  darkMode: boolean;
  searchQuery: string;
}

type Action =
  | { type: "SET_PROJECTS"; payload: CraftProject[] }
  | { type: "ADD_PROJECT"; payload: CraftProject }
  | { type: "UPDATE_PROJECT"; payload: CraftProject }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_HOURLY_RATE"; payload: number }
  | { type: "SET_DARK_MODE"; payload: boolean }
  | { type: "SET_SEARCH"; payload: string };

function reducer(state: CraftState, action: Action): CraftState {
  switch (action.type) {
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };
    case "SET_HOURLY_RATE":
      return { ...state, hourlyRate: action.payload };
    case "SET_DARK_MODE":
      return { ...state, darkMode: action.payload };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

function loadProjects(): CraftProject[] {
  try {
    const raw = localStorage.getItem("craft_projects");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    toast({ title: "⚠️ Data Warning", description: "Stored data was corrupted and has been reset.", variant: "destructive" });
    localStorage.removeItem("craft_projects");
    return [];
  }
}

function loadNumber(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    return v ? Number(v) : fallback;
  } catch { return fallback; }
}

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v ? v === "true" : fallback;
  } catch { return fallback; }
}

interface CraftContextValue extends CraftState {
  addProject: (p: Omit<CraftProject, "id" | "createdAt" | "updatedAt" | "totalHoursSpent">) => void;
  updateProject: (p: CraftProject) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  restoreProject: (id: string) => void;
  completeProject: (id: string) => void;
  addSession: (projectId: string, session: Omit<Session, "id">) => void;
  deleteSession: (projectId: string, sessionId: string) => void;
  updateMaterials: (projectId: string, materials: Material[]) => void;
  updateProgress: (projectId: string, progress: number) => void;
  setHourlyRate: (rate: number) => void;
  setDarkMode: (dark: boolean) => void;
  setSearchQuery: (q: string) => void;
  filteredProjects: CraftProject[];
}

const CraftContext = createContext<CraftContextValue | null>(null);

export function CraftProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    projects: loadProjects(),
    hourlyRate: loadNumber("craft_hourly_rate", 15),
    darkMode: loadBool("craft_dark_mode", false),
    searchQuery: "",
  });

  // Persist projects
  useEffect(() => {
    localStorage.setItem("craft_projects", JSON.stringify(state.projects));
  }, [state.projects]);

  useEffect(() => {
    localStorage.setItem("craft_hourly_rate", String(state.hourlyRate));
  }, [state.hourlyRate]);

  useEffect(() => {
    localStorage.setItem("craft_dark_mode", String(state.darkMode));
    document.documentElement.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  const addProject = useCallback((p: Omit<CraftProject, "id" | "createdAt" | "updatedAt" | "totalHoursSpent">) => {
    const now = new Date().toISOString();
    dispatch({
      type: "ADD_PROJECT",
      payload: { ...p, id: uuid(), totalHoursSpent: 0, createdAt: now, updatedAt: now },
    });
  }, []);

  const updateProject = useCallback((p: CraftProject) => {
    dispatch({ type: "UPDATE_PROJECT", payload: { ...p, updatedAt: new Date().toISOString() } });
  }, []);

  const deleteProject = useCallback((id: string) => {
    dispatch({ type: "DELETE_PROJECT", payload: id });
  }, []);

  const archiveProject = useCallback((id: string) => {
    const p = state.projects.find((x) => x.id === id);
    if (p) updateProject({ ...p, status: "archived" });
  }, [state.projects, updateProject]);

  const restoreProject = useCallback((id: string) => {
    const p = state.projects.find((x) => x.id === id);
    if (p) updateProject({ ...p, status: "wip" });
  }, [state.projects, updateProject]);

  const completeProject = useCallback((id: string) => {
    const p = state.projects.find((x) => x.id === id);
    if (p) updateProject({ ...p, status: "completed", progress: 100 });
  }, [state.projects, updateProject]);

  const addSession = useCallback((projectId: string, session: Omit<Session, "id">) => {
    const p = state.projects.find((x) => x.id === projectId);
    if (p) {
      const newSession = { ...session, id: uuid() };
      const sessions = [...p.sessions, newSession];
      const totalHoursSpent = sessions.reduce((s, x) => s + x.hoursLogged, 0);
      updateProject({ ...p, sessions, totalHoursSpent });
    }
  }, [state.projects, updateProject]);

  const deleteSession = useCallback((projectId: string, sessionId: string) => {
    const p = state.projects.find((x) => x.id === projectId);
    if (p) {
      const sessions = p.sessions.filter((s) => s.id !== sessionId);
      const totalHoursSpent = sessions.reduce((s, x) => s + x.hoursLogged, 0);
      updateProject({ ...p, sessions, totalHoursSpent });
    }
  }, [state.projects, updateProject]);

  const updateMaterials = useCallback((projectId: string, materials: Material[]) => {
    const p = state.projects.find((x) => x.id === projectId);
    if (p) updateProject({ ...p, materials });
  }, [state.projects, updateProject]);

  const updateProgress = useCallback((projectId: string, progress: number) => {
    const p = state.projects.find((x) => x.id === projectId);
    if (p) updateProject({ ...p, progress });
  }, [state.projects, updateProject]);

  const setHourlyRate = useCallback((rate: number) => {
    dispatch({ type: "SET_HOURLY_RATE", payload: rate });
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    dispatch({ type: "SET_DARK_MODE", payload: dark });
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    dispatch({ type: "SET_SEARCH", payload: q });
  }, []);

  const filteredProjects = state.projects.filter((p) => {
    if (!state.searchQuery) return true;
    const q = state.searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
  });

  return (
    <CraftContext.Provider
      value={{
        ...state,
        addProject, updateProject, deleteProject, archiveProject, restoreProject,
        completeProject, addSession, deleteSession, updateMaterials, updateProgress,
        setHourlyRate, setDarkMode, setSearchQuery, filteredProjects,
      }}
    >
      {children}
    </CraftContext.Provider>
  );
}

export function useCraft() {
  const ctx = useContext(CraftContext);
  if (!ctx) throw new Error("useCraft must be used within CraftProvider");
  return ctx;
}
