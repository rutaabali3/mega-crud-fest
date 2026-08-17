import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { WishItem, ViewMode, SortOption, StatusFilter, Priority } from "@/types/wishlist";

export function useWishlist() {
  const [items, setItems] = useLocalStorage<WishItem[]>("wishlist_items", []);
  const [people, setPeople] = useLocalStorage<string[]>("wishlist_people", []);
  const [budgets, setBudgets] = useLocalStorage<Record<string, number>>("wishlist_budgets", {});
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("wishlist_view", "grid");
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("wishlist_theme", "light");

  const addItem = useCallback(
    (item: Omit<WishItem, "id" | "createdAt" | "updatedAt" | "claimed" | "purchased">) => {
      const now = new Date().toISOString();
      const newItem: WishItem = {
        ...item,
        id: crypto.randomUUID(),
        claimed: false,
        purchased: false,
        createdAt: now,
        updatedAt: now,
      };
      setItems((prev) => [newItem, ...prev]);
      if (item.forPerson && !people.includes(item.forPerson)) {
        setPeople((prev) => [...prev, item.forPerson]);
      }
    },
    [setItems, people, setPeople]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<WishItem>) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        )
      );
      if (updates.forPerson && !people.includes(updates.forPerson)) {
        setPeople((prev) => [...prev, updates.forPerson!]);
      }
    },
    [setItems, people, setPeople]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const clearPurchased = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.purchased));
  }, [setItems]);

  const setBudget = useCallback(
    (person: string, amount: number) => {
      setBudgets((prev) => ({ ...prev, [person]: amount }));
    },
    [setBudgets]
  );

  return {
    items,
    people,
    budgets,
    viewMode,
    setViewMode,
    theme,
    setTheme,
    addItem,
    updateItem,
    deleteItem,
    clearPurchased,
    setBudget,
    setItems,
  };
}

export function useFilteredItems(
  items: WishItem[],
  filters: {
    search: string;
    person: string;
    occasion: string;
    status: StatusFilter;
    priority: Priority | "all";
    priceRange: [number, number];
    sort: SortOption;
  }
) {
  return useMemo(() => {
    let filtered = [...items];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.forPerson.toLowerCase().includes(q) ||
          i.occasion.toLowerCase().includes(q) ||
          (i.notes?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filters.person && filters.person !== "all") {
      filtered = filtered.filter((i) => i.forPerson === filters.person);
    }
    if (filters.occasion && filters.occasion !== "all") {
      filtered = filtered.filter((i) => i.occasion === filters.occasion);
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((i) => {
        if (filters.status === "purchased") return i.purchased;
        if (filters.status === "claimed") return i.claimed && !i.purchased;
        if (filters.status === "unclaimed") return !i.claimed && !i.purchased;
        return true;
      });
    }
    if (filters.priority !== "all") {
      filtered = filtered.filter((i) => i.priority === filters.priority);
    }
    filtered = filtered.filter(
      (i) => i.price >= filters.priceRange[0] && i.price <= filters.priceRange[1]
    );

    switch (filters.sort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "priority": {
        const order = { high: 0, medium: 1, low: 2 };
        filtered.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
      }
      case "person-az":
        filtered.sort((a, b) => a.forPerson.localeCompare(b.forPerson));
        break;
    }

    return filtered;
  }, [items, filters]);
}
