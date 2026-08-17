import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const newValue = value instanceof Function ? value(prev) : value;
        localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      }
    }
  }, [key]);

  return [storedValue, setValue];
}
