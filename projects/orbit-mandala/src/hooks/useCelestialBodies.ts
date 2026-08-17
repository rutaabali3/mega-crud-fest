import { useState, useEffect, useCallback } from "react";
import { CelestialBody, DEFAULT_BODIES } from "@/types/celestial";

const STORAGE_KEY = "orbit-mandala-bodies";

export function useCelestialBodies() {
  const [bodies, setBodies] = useState<CelestialBody[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_BODIES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bodies));
  }, [bodies]);

  const addBody = useCallback((body: Omit<CelestialBody, "id" | "createdAt">) => {
    const newBody: CelestialBody = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setBodies((prev) => [...prev, newBody]);
    return newBody;
  }, []);

  const updateBody = useCallback((id: string, updates: Partial<CelestialBody>) => {
    setBodies((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const removeBody = useCallback((id: string) => {
    setBodies((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { bodies, addBody, updateBody, removeBody };
}
