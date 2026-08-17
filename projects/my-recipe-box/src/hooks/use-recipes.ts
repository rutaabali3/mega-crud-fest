import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/lib/types";
import { sampleRecipes } from "@/lib/sample-recipes";

const STORAGE_KEY = "recipes";

function loadRecipes(): Recipe[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleRecipes));
  return sampleRecipes;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  const persist = useCallback((updated: Recipe[]) => {
    setRecipes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addRecipe = useCallback((recipe: Omit<Recipe, "id" | "createdAt">) => {
    const newRecipe: Recipe = { ...recipe, id: Date.now(), createdAt: Date.now() };
    persist([...recipes, newRecipe]);
    return newRecipe;
  }, [recipes, persist]);

  const updateRecipe = useCallback((id: number, data: Partial<Recipe>) => {
    persist(recipes.map(r => r.id === id ? { ...r, ...data } : r));
  }, [recipes, persist]);

  const deleteRecipe = useCallback((id: number) => {
    persist(recipes.filter(r => r.id !== id));
  }, [recipes, persist]);

  const importRecipes = useCallback((imported: Recipe[]) => {
    persist([...recipes, ...imported.map(r => ({ ...r, id: Date.now() + Math.random() }))]);
  }, [recipes, persist]);

  return { recipes, addRecipe, updateRecipe, deleteRecipe, importRecipes, setRecipes: persist };
}
