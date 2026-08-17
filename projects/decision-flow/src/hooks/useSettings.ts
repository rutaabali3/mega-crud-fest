import { useState, useEffect, useCallback } from "react";
import { AppSettings } from "@/types/decision";

const SETTINGS_KEY = "decision_journal_settings";

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  showConfidence: true,
  showBiasTags: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      }
    } catch { /* use defaults */ }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
