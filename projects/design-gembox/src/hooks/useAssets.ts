import { useState, useEffect, useCallback, useMemo } from "react";
import { Asset, AssetType } from "@/types/asset";
import { seedAssets } from "@/lib/seed-data";

const STORAGE_KEY = "assetvault_assets";

function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAssets));
  return seedAssets;
}

function saveAssets(assets: Asset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(loadAssets);

  useEffect(() => { saveAssets(assets); }, [assets]);

  const addAsset = useCallback((asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newAsset: Asset = { ...asset, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setAssets(prev => [...prev, newAsset]);
    return newAsset;
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  const deleteProjectAssets = useCallback((project: string) => {
    setAssets(prev => prev.filter(a => a.project !== project));
  }, []);

  const projects = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach(a => map.set(a.project, (map.get(a.project) || 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [assets]);

  const typeCounts = useMemo(() => {
    const counts: Record<AssetType, number> = { color: 0, font: 0, icon: 0, image: 0 };
    assets.forEach(a => counts[a.type]++);
    return counts;
  }, [assets]);

  return { assets, addAsset, updateAsset, deleteAsset, deleteProjectAssets, projects, typeCounts };
}
