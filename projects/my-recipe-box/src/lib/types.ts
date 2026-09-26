import { z } from "zod";

export const recipeSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  cuisine: z.string(),
  photoURL: z.string(),
  prepTime: z.number(),
  servings: z.number(),
  ingredients: z.array(z.string()),
  instructions: z.string(),
  createdAt: z.number().optional(),
});

export const recipeArraySchema = z.array(recipeSchema);

export interface Recipe {
  id: number;
  title: string;
  cuisine: string;
  photoURL: string;
  prepTime: number;
  servings: number;
  ingredients: string[];
  instructions: string;
  createdAt: number;
}

export interface ShoppingItem {
  text: string;
  checked: boolean;
}
