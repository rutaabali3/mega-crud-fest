import { useState, useEffect, useCallback } from "react";

export type Category = "Food" | "Medicine" | "Household" | "Beauty" | "Other";

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  category: Category;
  lowStockThreshold: number;
}

const STORAGE_KEY = "pantrypal-items";

function loadItems(): PantryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items: PantryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function usePantryStore() {
  const [items, setItems] = useState<PantryItem[]>(loadItems);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const addItem = useCallback((item: Omit<PantryItem, "id">) => {
    const newItem: PantryItem = { ...item, id: crypto.randomUUID() };
    setItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<PantryItem, "id">>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updates } : it)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const adjustQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it))
    );
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const expiredItems = items.filter((it) => new Date(it.expiryDate) < today);
  const expiringSoonItems = items.filter((it) => {
    const d = new Date(it.expiryDate);
    return d >= today && d <= in7Days;
  });
  const lowStockItems = items.filter((it) => it.quantity <= it.lowStockThreshold);
  const shoppingList = lowStockItems;
  const categories = [...new Set(items.map((it) => it.category))];

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    adjustQuantity,
    clearAll,
    expiredItems,
    expiringSoonItems,
    lowStockItems,
    shoppingList,
    categories,
  };
}
