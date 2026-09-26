import { useState, useEffect, useCallback } from "react";
import { Recipe, recipeArraySchema } from "@/lib/types";
import { sampleRecipes } from "@/lib/sample-recipes";

const STORAGE_KEY = "recipes";

function loadRecipes(): Recipe[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const result = recipeArraySchema.safeParse(parsed);
      if (result.success) {
        return result.data as Recipe[];
      }
    }
  } catch {
    // Ignore invalid JSON or storage errors
  }
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
    const timestamp = Date.now();
    const formatted = imported.map((r, index) => ({
      ...r,
      id: r.id ?? timestamp + index + Math.random(),
      createdAt: r.createdAt ?? timestamp + index,
    }));
    persist([...recipes, ...formatted]);
  }, [recipes, persist]);

  return { recipes, addRecipe, updateRecipe, deleteRecipe, importRecipes, setRecipes: persist };
}
