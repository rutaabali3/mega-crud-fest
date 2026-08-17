import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('petcare_theme', 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggle };
}
