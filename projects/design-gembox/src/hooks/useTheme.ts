import { useState, useEffect } from "react";

const KEY = "assetvault_theme";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(KEY);
    return stored ? stored === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem(KEY, dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
