import { useState, useCallback } from "react";
import { ShoppingItem } from "@/lib/types";

const KEY = "shoppingList";

function load(): ShoppingItem[] {
  try {
    const d = localStorage.getItem(KEY);
    if (d) return JSON.parse(d);
  } catch {}
  return [];
}

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(load);

  const persist = useCallback((updated: ShoppingItem[]) => {
    setItems(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }, []);

  const addItems = useCallback((ingredients: string[]) => {
    const current = load();
    const existingTexts = new Set(current.map(i => i.text.toLowerCase()));
    const newItems = ingredients
      .filter(i => !existingTexts.has(i.toLowerCase()))
      .map(text => ({ text, checked: false }));
    persist([...current, ...newItems]);
    return newItems.length;
  }, [persist]);

  const toggleItem = useCallback((index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    persist(updated);
  }, [items, persist]);

  const removeItem = useCallback((index: number) => {
    persist(items.filter((_, i) => i !== index));
  }, [items, persist]);

  const clearAll = useCallback(() => persist([]), [persist]);

  const exportAsText = useCallback(() => {
    return items.map(i => `${i.checked ? "✓" : "○"} ${i.text}`).join("\n");
  }, [items]);

  return { items, addItems, toggleItem, removeItem, clearAll, exportAsText };
}
