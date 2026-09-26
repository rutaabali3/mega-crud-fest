import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { cinemaItemSchema, type CinemaItem, type ItemStatus } from "@/types/cinema";

const STORAGE_KEY = "cinemaVault";

const itemsArraySchema = z.array(cinemaItemSchema);

function loadItems(): CinemaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = itemsArraySchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function saveItems(items: CinemaItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCinemaVault() {
  const [items, setItems] = useState<CinemaItem[]>(loadItems);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback((item: Omit<CinemaItem, "id" | "addedDate">) => {
    const newItem: CinemaItem = {
      ...item,
      id: crypto.randomUUID(),
      addedDate: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<CinemaItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getByStatus = useCallback(
    (status: ItemStatus) => items.filter((item) => item.status === status),
    [items]
  );

  const getRandomPick = useCallback(() => {
    const eligible = items.filter((i) => i.status === "To Watch" || i.status === "Watching");
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, [items]);

  const stats = {
    total: items.length,
    watched: items.filter((i) => i.status === "Watched").length,
    watching: items.filter((i) => i.status === "Watching").length,
    toWatch: items.filter((i) => i.status === "To Watch").length,
    avgRating:
      items.filter((i) => i.personalRating > 0).length > 0
        ? items.filter((i) => i.personalRating > 0).reduce((a, b) => a + b.personalRating, 0) /
          items.filter((i) => i.personalRating > 0).length
        : 0,
  };

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cinemaVault-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      const result = itemsArraySchema.safeParse(parsed);
      if (result.success) {
        setItems(result.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    getByStatus,
    getRandomPick,
    stats,
    exportData,
    importData,
    clearAll,
  };
}
