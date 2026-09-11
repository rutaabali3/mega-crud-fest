import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCinemaVault } from "./useCinemaVault";
import type { CinemaItem } from "@/types/cinema";

const STORAGE_KEY = "cinemaVault";

const mockItems: CinemaItem[] = [
  {
    id: "1",
    title: "Inception",
    type: "Movie",
    posterUrl: "https://example.com/inception.jpg",
    status: "Watched",
    personalRating: 5,
    review: "Masterpiece",
    addedDate: "2023-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Breaking Bad",
    type: "Series",
    posterUrl: "https://example.com/bb.jpg",
    status: "Watching",
    personalRating: 4,
    review: "Great show",
    addedDate: "2023-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Dune",
    type: "Movie",
    posterUrl: "https://example.com/dune.jpg",
    status: "To Watch",
    personalRating: 0,
    review: "",
    addedDate: "2023-01-03T00:00:00.000Z",
  },
];

describe("useCinemaVault", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Initial load and persistence", () => {
    it("should initialize with empty array when localStorage is empty", () => {
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });

    it("should initialize with items from localStorage when valid JSON exists", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual(mockItems);
    });

    it("should fallback to empty array when localStorage contains invalid JSON", () => {
      localStorage.setItem(STORAGE_KEY, "invalid-json");
      const { result } = renderHook(() => useCinemaVault());
      expect(result.current.items).toEqual([]);
    });

    it("should persist items to localStorage when state changes", () => {
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.addItem({
          title: "Interstellar",
          type: "Movie",
          posterUrl: "https://example.com/interstellar.jpg",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Interstellar");
    });
  });

  describe("addItem", () => {
    it("should add a new item with generated id and addedDate prepended to items list", () => {
      const { result } = renderHook(() => useCinemaVault());

      let addedItem: CinemaItem | undefined;
      act(() => {
        addedItem = result.current.addItem({
          title: "The Matrix",
          type: "Movie",
          posterUrl: "https://example.com/matrix.jpg",
          status: "To Watch",
          personalRating: 0,
          review: "",
        });
      });

      expect(addedItem).toBeDefined();
      expect(addedItem?.id).toBeDefined();
      expect(addedItem?.addedDate).toBeDefined();
      expect(addedItem?.title).toBe("The Matrix");

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toEqual(addedItem);
    });
  });

  describe("updateItem", () => {
    it("should update properties of an existing item", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.updateItem("3", {
          status: "Watching",
          personalRating: 4,
        });
      });

      const updated = result.current.items.find((i) => i.id === "3");
      expect(updated?.status).toBe("Watching");
      expect(updated?.personalRating).toBe(4);
      expect(updated?.title).toBe("Dune");
    });

    it("should leave items unchanged if ID does not match", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.updateItem("non-existent-id", { status: "Watched" });
      });

      expect(result.current.items).toEqual(mockItems);
    });
  });

  describe("deleteItem", () => {
    it("should remove item by id", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      act(() => {
        result.current.deleteItem("2");
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items.some((i) => i.id === "2")).toBe(false);
    });
  });

  describe("getByStatus", () => {
    it("should filter items by specified status", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      const watched = result.current.getByStatus("Watched");
      expect(watched).toHaveLength(1);
      expect(watched[0].title).toBe("Inception");

      const watching = result.current.getByStatus("Watching");
      expect(watching).toHaveLength(1);
      expect(watching[0].title).toBe("Breaking Bad");

      const toWatch = result.current.getByStatus("To Watch");
      expect(toWatch).toHaveLength(1);
      expect(toWatch[0].title).toBe("Dune");
    });
  });

  describe("getRandomPick", () => {
    it("should return null when there are no eligible items (To Watch or Watching)", () => {
      const onlyWatched: CinemaItem[] = [
        {
          id: "1",
          title: "Inception",
          type: "Movie",
          posterUrl: "https://example.com/inception.jpg",
          status: "Watched",
          personalRating: 5,
          review: "Masterpiece",
          addedDate: "2023-01-01T00:00:00.000Z",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyWatched));
      const { result } = renderHook(() => useCinemaVault());

      expect(result.current.getRandomPick()).toBeNull();
    });

    it("should return an eligible item when eligible items exist", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      const pick = result.current.getRandomPick();
      expect(pick).not.toBeNull();
      expect(["To Watch", "Watching"]).toContain(pick?.status);
    });
  });

  describe("stats", () => {
    it("should compute correct statistics including total, status counts, and average rating", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      expect(result.current.stats).toEqual({
        total: 3,
        watched: 1,
        watching: 1,
        toWatch: 1,
        avgRating: 4.5, // (5 + 4) / 2
      });
    });

    it("should return 0 avgRating when no items have a rating > 0", () => {
      const unratedItems: CinemaItem[] = [
        {
          id: "1",
          title: "Test Movie",
          type: "Movie",
          posterUrl: "",
          status: "To Watch",
          personalRating: 0,
          review: "",
          addedDate: "2023-01-01",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unratedItems));
      const { result } = renderHook(() => useCinemaVault());

      expect(result.current.stats.avgRating).toBe(0);
    });
  });

  describe("exportData", () => {
    it("should create JSON blob and trigger download", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/mock");
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const clickMock = vi.fn();
      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
        href: "",
        download: "",
        click: clickMock,
      } as unknown as HTMLAnchorElement);

      act(() => {
        result.current.exportData();
      });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/mock");

      createElementSpy.mockRestore();
    });
  });

  describe("importData", () => {
    it("should import valid JSON array and update state", () => {
      const { result } = renderHook(() => useCinemaVault());

      let success: boolean = false;
      act(() => {
        success = result.current.importData(JSON.stringify(mockItems));
      });

      expect(success).toBe(true);
      expect(result.current.items).toEqual(mockItems);
    });

    it("should return false for invalid JSON string", () => {
      const { result } = renderHook(() => useCinemaVault());

      let success: boolean = true;
      act(() => {
        success = result.current.importData("invalid-json");
      });

      expect(success).toBe(false);
      expect(result.current.items).toEqual([]);
    });

    it("should return false if JSON is not an array", () => {
      const { result } = renderHook(() => useCinemaVault());

      let success: boolean = true;
      act(() => {
        success = result.current.importData(JSON.stringify({ notAnArray: true }));
      });

      expect(success).toBe(false);
      expect(result.current.items).toEqual([]);
    });
  });

  describe("clearAll", () => {
    it("should empty the items array", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockItems));
      const { result } = renderHook(() => useCinemaVault());

      expect(result.current.items).toHaveLength(3);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.items).toEqual([]);
    });
  });
});
