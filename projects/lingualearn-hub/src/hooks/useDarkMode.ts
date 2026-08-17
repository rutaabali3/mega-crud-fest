import { useEffect } from "react";
import { AppSettings } from "@/lib/types";

export function useDarkMode(darkMode: boolean) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
}
