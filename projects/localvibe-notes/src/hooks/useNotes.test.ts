import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNotes } from "./useNotes";

const STORAGE_KEY = "localvibenotes-data";

describe("useNotes", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("loadNotes error handling and initialization", () => {
    it("should handle invalid JSON in localStorage gracefully by returning an empty array", () => {
      localStorage.setItem(STORAGE_KEY, "{ invalid json }");

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toEqual([]);
      expect(result.current.activeNotes).toEqual([]);
      expect(result.current.trashedNotes).toEqual([]);
    });

    it("should initialize with notes from localStorage when valid JSON is present", () => {
      const mockNotes = [
        {
          id: "1",
          title: "Test Note",
          content: "Test Content",
          tags: ["test"],
          color: "#22c55e",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deleted: false,
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotes));

      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toEqual(mockNotes);
      expect(result.current.activeNotes).toEqual(mockNotes);
      expect(result.current.trashedNotes).toEqual([]);
    });

    it("should return empty array when localStorage key does not exist", () => {
      const { result } = renderHook(() => useNotes());

      expect(result.current.notes).toEqual([]);
    });
  });

  describe("createNote", () => {
    it("should create a new note with default values and prepend it to notes", () => {
      const { result } = renderHook(() => useNotes());

      let createdNote;
      act(() => {
        createdNote = result.current.createNote();
      });

      expect(createdNote).toBeDefined();
      expect(createdNote?.title).toBe("Untitled");
      expect(createdNote?.content).toBe("");
      expect(createdNote?.deleted).toBe(false);
      expect(result.current.notes.length).toBe(1);
      expect(result.current.notes[0]).toEqual(createdNote);
    });
  });
});
