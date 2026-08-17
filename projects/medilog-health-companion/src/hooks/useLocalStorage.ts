import { useState, useCallback } from "react";
import { getStorage, setStorage } from "@/utils/storage";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => getStorage(key, initialValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        setStorage(key, next);
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
