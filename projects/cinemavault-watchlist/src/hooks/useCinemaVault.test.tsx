import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useCinemaVault } from "./useCinemaVault";
import type { CinemaItem } from "@/types/cinema";

const STORAGE_KEY = "cinemaVault";

describe("useCinemaVault", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("loadItems & initial state", () => {
    it("should return an empty array when localStorage contains invalid JSON", () => {
      localStorage.setItem(STORAGE_KEY, "invalid { json");
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });

    it("should return an empty array when localStorage is empty", () => {
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });

    it("should return items stored in localStorage on initialization", () => {
      const existingItems: CinemaItem[] = [
        {
          id: "1",
          title: "Inception",
          type: "Movie",
          posterUrl: "https://example.com/inception.jpg",
          status: "Watched",
          personalRating: 5,
          review: "Great movie!",
          addedDate: "2023-01-01T00:00:00.000Z",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingItems));

      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual(existingItems);
    });
  });

  describe("addItem", () => {
    it("should add a new item with generated id and addedDate", () => {
      const { result } = renderHook(() => useCinemaVault());

      let added: CinemaItem | undefined;
      act(() => {
        added = result.current.addItem({
          title: "Interstellar",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      expect(added).toBeDefined();
      expect(added?.id).toBeDefined();
      expect(added?.addedDate).toBeDefined();
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].title).toBe("Interstellar");
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")).toHaveLength(1);
    });
  });

  describe("updateItem", () => {
    it("should update specified item by id", () => {
      const { result } = renderHook(() => useCinemaVault());

      let added: CinemaItem | undefined;
      act(() => {
        added = result.current.addItem({
          title: "Dune",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      act(() => {
        result.current.updateItem(added!.id, {
          status: "Watched",
          personalRating: 4.5,
        });
      });

      expect(result.current.items[0].status).toBe("Watched");
      expect(result.current.items[0].personalRating).toBe(4.5);
    });
  });

  describe("deleteItem", () => {
    it("should remove item by id", () => {
      const { result } = renderHook(() => useCinemaVault());

      let added: CinemaItem | undefined;
      act(() => {
        added = result.current.addItem({
          title: "The Matrix",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.deleteItem(added!.id);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("getByStatus", () => {
    it("should filter items by status", () => {
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.addItem({
          title: "Item 1",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
        result.current.addItem({
          title: "Item 2",
          type: "Series",
          posterUrl: "",
          status: "Watched",
          personalRating: 5,
          review: "",
        });
      });

      const toWatch = result.current.getByStatus("To Watch");
      const watched = result.current.getByStatus("Watched");

      expect(toWatch).toHaveLength(1);
      expect(toWatch[0].title).toBe("Item 1");
      expect(watched).toHaveLength(1);
      expect(watched[0].title).toBe("Item 2");
    });
  });

  describe("getRandomPick", () => {
    it("should return null if no items are 'To Watch' or 'Watching'", () => {
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.addItem({
          title: "Watched Movie",
          type: "Movie",
          posterUrl: "",
          status: "Watched",
          personalRating: 5,
          review: "",
        });
      });

      expect(result.current.getRandomPick()).toBeNull();
    });

    it("should return an eligible item when available", () => {
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.addItem({
          title: "To Watch Movie",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      const pick = result.current.getRandomPick();
      expect(pick).not.toBeNull();
      expect(pick?.title).toBe("To Watch Movie");
    });
  });

  describe("stats", () => {
    it("should calculate correct statistics", () => {
      const { result } = renderHook(() => useCinemaVault());

      expect(result.current.stats).toEqual({
        total: 0,
        watched: 0,
        watching: 0,
        toWatch: 0,
        avgRating: 0,
      });

      act(() => {
        result.current.addItem({
          title: "Movie A",
          type: "Movie",
          posterUrl: "",
          status: "Watched",
          personalRating: 4,
          review: "",
        });
        result.current.addItem({
          title: "Movie B",
          type: "Movie",
          posterUrl: "",
          status: "Watched",
          personalRating: 2,
          review: "",
        });
        result.current.addItem({
          title: "Series C",
          type: "Series",
          posterUrl: "",
          status: "Watching",
          personalRating: 0,
          review: "",
        });
        result.current.addItem({
          title: "Movie D",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      expect(result.current.stats).toEqual({
        total: 4,
        watched: 2,
        watching: 1,
        toWatch: 1,
        avgRating: 3, // (4 + 2) / 2
      });
    });
  });

  describe("importData & clearAll", () => {
    it("should import valid json array and return true", () => {
      const { result } = renderHook(() => useCinemaVault());

      const validJson = JSON.stringify([
        {
          id: "imported-1",
          title: "Imported Movie",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
          addedDate: "2023-01-01T00:00:00.000Z",
        },
      ]);

      let success: boolean | undefined;
      act(() => {
        success = result.current.importData(validJson);
      });

      expect(success).toBe(true);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].title).toBe("Imported Movie");
    });

    it("should return false on invalid JSON or non-array input", () => {
      const { result } = renderHook(() => useCinemaVault());

      let res1: boolean | undefined;
      let res2: boolean | undefined;

      act(() => {
        res1 = result.current.importData("{ invalid json }");
        res2 = result.current.importData(JSON.stringify({ notAnArray: true }));
      });

      expect(res1).toBe(false);
      expect(res2).toBe(false);
      expect(result.current.items).toHaveLength(0);
    });

    it("should clear all items when clearAll is called", () => {
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.addItem({
          title: "Item to clear",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      expect(result.current.items).toHaveLength(1);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("exportData", () => {
    it("should trigger download when exportData is called", () => {
      const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/test-url");
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.exportData();
      });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/test-url");

      clickSpy.mockRestore();
    });
  });
});
