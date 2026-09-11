import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCinemaVault } from "../hooks/useCinemaVault";
import type { CinemaItem } from "../types/cinema";

const STORAGE_KEY = "cinemaVault";

const sampleItem: CinemaItem = {
  id: "test-1",
  title: "Inception",
  type: "Movie",
  status: "To Watch",
  personalRating: 5,
  review: "Great movie",
  tags: ["Sci-Fi"],
  addedDate: "2025-01-01T00:00:00.000Z",
};

describe("useCinemaVault", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("loadItems & initial state", () => {
    it("should return empty array when localStorage is empty", () => {
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });

    it("should load existing items from localStorage when valid JSON is present", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleItem]));
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([sampleItem]);
    });

    it("should handle invalid JSON in localStorage gracefully by returning an empty array", () => {
      localStorage.setItem(STORAGE_KEY, "{ invalid json string }");
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });

    it("should handle localStorage.getItem throwing an error by returning an empty array", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
        throw new Error("Storage access error");
      });
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });
  });

  describe("hook operations", () => {
    it("should add a new item", () => {
      const { result } = renderHook(() => useCinemaVault());

      let addedItem: CinemaItem | undefined;
      act(() => {
        addedItem = result.current.addItem({
          title: "Interstellar",
          type: "Movie",
          status: "To Watch",
          personalRating: 0,
          tags: ["Space"],
        });
      });

      expect(result.current.items.length).toBe(1);
      expect(result.current.items[0].title).toBe("Interstellar");
      expect(addedItem).toBeDefined();
      expect(addedItem?.id).toBeDefined();
      expect(addedItem?.addedDate).toBeDefined();
    });

    it("should update an existing item", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleItem]));
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.updateItem("test-1", { status: "Watched", personalRating: 4 });
      });

      expect(result.current.items[0].status).toBe("Watched");
      expect(result.current.items[0].personalRating).toBe(4);
    });

    it("should delete an item", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleItem]));
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.deleteItem("test-1");
      });

      expect(result.current.items).toEqual([]);
    });

    it("should get items by status", () => {
      const item2: CinemaItem = { ...sampleItem, id: "test-2", status: "Watched" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleItem, item2]));
      const { result } = renderHook(() => useCinemaVault());

      const toWatch = result.current.getByStatus("To Watch");
      expect(toWatch.length).toBe(1);
      expect(toWatch[0].id).toBe("test-1");

      const watched = result.current.getByStatus("Watched");
      expect(watched.length).toBe(1);
      expect(watched[0].id).toBe("test-2");
    });

    it("should handle getRandomPick", () => {
      const { result: emptyResult } = renderHook(() => useCinemaVault());
      expect(emptyResult.current.getRandomPick()).toBeNull();

      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleItem]));
      const { result } = renderHook(() => useCinemaVault());

      const pick = result.current.getRandomPick();
      expect(pick).toEqual(sampleItem);
    });

    it("should calculate stats correctly", () => {
      const items: CinemaItem[] = [
        { ...sampleItem, id: "1", status: "To Watch", personalRating: 0 },
        { ...sampleItem, id: "2", status: "Watching", personalRating: 3 },
        { ...sampleItem, id: "3", status: "Watched", personalRating: 5 },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      const { result } = renderHook(() => useCinemaVault());

      expect(result.current.stats.total).toBe(3);
      expect(result.current.stats.toWatch).toBe(1);
      expect(result.current.stats.watching).toBe(1);
      expect(result.current.stats.watched).toBe(1);
      expect(result.current.stats.avgRating).toBe(4);
    });

    it("should handle importData", () => {
      const { result } = renderHook(() => useCinemaVault());

      let success = false;
      act(() => {
        success = result.current.importData("invalid json");
      });
      expect(success).toBe(false);

      act(() => {
        success = result.current.importData(JSON.stringify({ notAnArray: true }));
      });
      expect(success).toBe(false);

      act(() => {
        success = result.current.importData(JSON.stringify([sampleItem]));
      });
      expect(success).toBe(true);
      expect(result.current.items).toEqual([sampleItem]);
    });

    it("should clear all items", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleItem]));
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.items).toEqual([]);
    });
  });
});
