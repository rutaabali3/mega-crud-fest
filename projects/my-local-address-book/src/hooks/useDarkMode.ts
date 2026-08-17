import { useState, useEffect } from "react";

const DARK_MODE_KEY = "local-contacts-dark-mode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, String(isDark));
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((p) => !p) };
}
