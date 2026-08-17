import { useState, useCallback, useEffect, useMemo } from "react";
import { MediaItem, MediaStatus, MediaType } from "@/lib/types";
import { loadItems, saveItems } from "@/lib/storage";

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>(loadItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MediaStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");

  useEffect(() => { saveItems(items); }, [items]);

  const addItem = useCallback((item: Omit<MediaItem, "id" | "dateAdded">) => {
    const newItem: MediaItem = { ...item, id: crypto.randomUUID(), dateAdded: new Date().toISOString() };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<MediaItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const markFinished = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "finished" as const, progress: { ...i.progress, current: i.progress.total } } : i));
  }, []);

  const replaceAll = useCallback((newItems: MediaItem[]) => { setItems(newItems); }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (statusFilter !== "all") result = result.filter(i => i.status === statusFilter);
    if (typeFilter !== "all") result = result.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.creator.toLowerCase().includes(q));
    }
    return result;
  }, [items, statusFilter, typeFilter, search]);

  const stats = useMemo(() => ({
    total: items.length,
    finished: items.filter(i => i.status === "finished").length,
    avgRating: items.length ? +(items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1) : 0,
  }), [items]);

  return { items, filtered, stats, search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter, addItem, updateItem, deleteItem, markFinished, replaceAll };
}
