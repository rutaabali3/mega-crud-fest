import { describe, it, expect } from "vitest";
import { recipeArraySchema } from "../lib/types";

describe("Recipe JSON Schema Validation", () => {
  it("validates a correct recipe array", () => {
    const validRecipes = [
      {
        id: 1,
        title: "Test Pasta",
        cuisine: "Italian",
        photoURL: "https://example.com/pasta.jpg",
        prepTime: 20,
        servings: 2,
        ingredients: ["Noodles", "Sauce"],
        instructions: "Boil noodles and add sauce.",
        createdAt: 1700000000000,
      },
    ];

    const result = recipeArraySchema.safeParse(validRecipes);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Test Pasta");
    }
  });

  it("validates recipes without optional id or createdAt", () => {
    const validRecipes = [
      {
        title: "Test Salad",
        cuisine: "Greek",
        photoURL: "",
        prepTime: 10,
        servings: 1,
        ingredients: ["Lettuce", "Feta", "Olives"],
        instructions: "Mix ingredients in a bowl.",
      },
    ];

    const result = recipeArraySchema.safeParse(validRecipes);
    expect(result.success).toBe(true);
  });

  it("rejects non-array payloads", () => {
    const invalidPayload = {
      title: "Not an array",
      cuisine: "Italian",
    };

    const result = recipeArraySchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it("rejects recipes missing required fields", () => {
    const invalidRecipes = [
      {
        title: "Incomplete Recipe",
      },
    ];

    const result = recipeArraySchema.safeParse(invalidRecipes);
    expect(result.success).toBe(false);
  });

  it("rejects recipes with incorrect property data types", () => {
    const invalidRecipes = [
      {
        title: "Bad Types Recipe",
        cuisine: "Italian",
        photoURL: "https://example.com/pic.jpg",
        prepTime: "thirty minutes",
        servings: 4,
        ingredients: "Noodles and Sauce",
        instructions: "Cook it.",
      },
    ];

    const result = recipeArraySchema.safeParse(invalidRecipes);
    expect(result.success).toBe(false);
  });

  it("rejects payloads with malicious object structures or arbitrary invalid property types", () => {
    const maliciousPayload = [
      {
        title: 12345,
      },
    ];

    const result = recipeArraySchema.safeParse(maliciousPayload);
    expect(result.success).toBe(false);
  });
});
