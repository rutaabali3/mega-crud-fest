import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Program, WorkoutSession, Measurement, AppSettings } from "@/types";
import { seedPrograms } from "@/data/seedData";

interface RestTimerState {
  active: boolean;
  remaining: number;
  total: number;
  paused: boolean;
}

interface WorkoutContextValue {
  programs: Program[];
  setPrograms: (p: Program[]) => void;
  sessions: WorkoutSession[];
  setSessions: (s: WorkoutSession[]) => void;
  measurements: Measurement[];
  setMeasurements: (m: Measurement[]) => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  restTimer: RestTimerState;
  startRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  skipRestTimer: () => void;
}

const defaultSettings: AppSettings = {
  weightUnit: "kg",
  theme: "dark",
  restTimerSound: true,
  defaultRestSeconds: 90,
};

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [programs, setPrograms] = useLocalStorage<Program[]>("ironlog_programs", []);
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>("ironlog_sessions", []);
  const [measurements, setMeasurements] = useLocalStorage<Measurement[]>("ironlog_measurements", []);
  const [settings, setSettings] = useLocalStorage<AppSettings>("ironlog_settings", defaultSettings);

  // Seed programs on first load
  useEffect(() => {
    if (programs.length === 0) {
      setPrograms(seedPrograms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rest timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    remaining: 0,
    total: 0,
    paused: false,
  });
  const intervalRef = useRef<number | null>(null);

  const playBeep = useCallback(() => {
    if (!settings.restTimerSound) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, [settings.restTimerSound]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRestTimer = useCallback((seconds: number) => {
    clearTimer();
    setRestTimer({ active: true, remaining: seconds, total: seconds, paused: false });
    intervalRef.current = window.setInterval(() => {
      setRestTimer((prev) => {
        if (prev.paused) return prev;
        if (prev.remaining <= 1) {
          clearTimer();
          playBeep();
          return { ...prev, remaining: 0, active: false };
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
  }, [clearTimer, playBeep]);

  const pauseRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, paused: true }));
  }, []);

  const resumeRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, paused: false }));
  }, []);

  const skipRestTimer = useCallback(() => {
    clearTimer();
    setRestTimer({ active: false, remaining: 0, total: 0, paused: false });
  }, [clearTimer]);

  return (
    <WorkoutContext.Provider
      value={{
        programs, setPrograms,
        sessions, setSessions,
        measurements, setMeasurements,
        settings, setSettings,
        restTimer, startRestTimer, pauseRestTimer, resumeRestTimer, skipRestTimer,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
