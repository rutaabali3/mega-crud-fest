import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("fintrack_theme") as Theme | null;
    return stored || "system";
  });

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", t === "dark");
    }
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      localStorage.setItem("fintrack_theme", t);
      applyTheme(t);
    },
    [applyTheme]
  );

  useEffect(() => {
    applyTheme(theme);
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  return { theme, setTheme };
}
