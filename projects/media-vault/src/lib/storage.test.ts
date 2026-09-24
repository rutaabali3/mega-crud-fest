import { describe, it, expect, beforeEach } from "vitest";
import { loadItems, saveItems, importItems } from "./storage";
import { MediaItem } from "./types";

const validItem: MediaItem = {
  id: "1",
  type: "book",
  title: "Test Book",
  creator: "Test Author",
  rating: 5,
  status: "finished",
  review: "Great book!",
  progress: { current: 100, total: 100 },
  imageUrl: "https://example.com/image.jpg",
  dateAdded: "2025-01-01",
};

describe("storage lib validation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadItems", () => {
    it("returns empty array when localStorage is empty", () => {
      expect(loadItems()).toEqual([]);
    });

    it("returns valid items from localStorage", () => {
      saveItems([validItem]);
      expect(loadItems()).toEqual([validItem]);
    });

    it("returns empty array if localStorage content fails schema validation", () => {
      localStorage.setItem("mediavault", JSON.stringify([{ invalidField: "malicious" }]));
      expect(loadItems()).toEqual([]);
    });

    it("returns empty array if localStorage content is invalid JSON", () => {
      localStorage.setItem("mediavault", "{bad-json");
      expect(loadItems()).toEqual([]);
    });
  });

  describe("importItems", () => {
    it("resolves valid array of MediaItems", async () => {
      const blob = new Blob([JSON.stringify([validItem])], { type: "application/json" });
      const file = new File([blob], "items.json", { type: "application/json" });

      const result = await importItems(file);
      expect(result).toEqual([validItem]);
    });

    it("rejects with 'Invalid JSON' when file content is not valid JSON", async () => {
      const file = new File(["not json content"], "bad.json", { type: "application/json" });

      await expect(importItems(file)).rejects.toThrow("Invalid JSON");
    });

    it("rejects with 'Invalid format' when array contains invalid object schema", async () => {
      const invalidData = [
        {
          id: "1",
          type: "invalid_type", // Invalid enum
          title: "Test",
        },
      ];
      const file = new File([JSON.stringify(invalidData)], "invalid.json", { type: "application/json" });

      await expect(importItems(file)).rejects.toThrow("Invalid format");
    });

    it("rejects with 'Invalid format' when JSON is an object instead of array", async () => {
      const file = new File([JSON.stringify(validItem)], "single.json", { type: "application/json" });

      await expect(importItems(file)).rejects.toThrow("Invalid format");
    });
  });
});
