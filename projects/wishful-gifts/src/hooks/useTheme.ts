import { useEffect } from "react";

export function useThemeEffect(theme: "light" | "dark") {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
