import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotes, Note } from "../hooks/useNotes";

const STORAGE_KEY = "localvibenotes-data";

describe("useNotes hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Initial State & localStorage Sync", () => {
    it("should initialize with empty array when localStorage is empty", () => {
      const { result } = renderHook(() => useNotes());
      expect(result.current.notes).toEqual([]);
      expect(result.current.activeNotes).toEqual([]);
      expect(result.current.trashedNotes).toEqual([]);
    });

    it("should initialize with parsed notes from localStorage", () => {
      const initialNotes: Note[] = [
        {
          id: "1",
          title: "Saved Note",
          content: "Content",
          tags: ["test"],
          color: "#22c55e",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
          deleted: false,
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotes));

      const { result } = renderHook(() => useNotes());
      expect(result.current.notes).toEqual(initialNotes);
      expect(result.current.activeNotes).toEqual(initialNotes);
    });

    it("should fallback gracefully to empty array when localStorage JSON is invalid", () => {
      localStorage.setItem(STORAGE_KEY, "invalid-json{");

      const { result } = renderHook(() => useNotes());
      expect(result.current.notes).toEqual([]);
    });

    it("should persist notes to localStorage on change", () => {
      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.createNote();
      });

      const storedRaw = localStorage.getItem(STORAGE_KEY);
      expect(storedRaw).not.toBeNull();
      const storedNotes = JSON.parse(storedRaw!);
      expect(storedNotes.length).toBe(1);
      expect(storedNotes[0].title).toBe("Untitled");
    });
  });

  describe("createNote", () => {
    it("should create a new default note and prepend it to notes", () => {
      const { result } = renderHook(() => useNotes());

      let createdNote: Note | undefined;
      act(() => {
        createdNote = result.current.createNote();
      });

      expect(createdNote).toBeDefined();
      expect(createdNote?.title).toBe("Untitled");
      expect(createdNote?.content).toBe("");
      expect(createdNote?.tags).toEqual([]);
      expect(createdNote?.color).toBe("#22c55e");
      expect(createdNote?.deleted).toBe(false);
      expect(createdNote?.id).toBeTruthy();

      expect(result.current.notes.length).toBe(1);
      expect(result.current.notes[0]).toEqual(createdNote);
      expect(result.current.activeNotes.length).toBe(1);
    });
  });

  describe("updateNote", () => {
    it("should update specified note fields and update updatedAt timestamp", () => {
      const { result } = renderHook(() => useNotes());

      let initialNote: Note;
      act(() => {
        initialNote = result.current.createNote();
      });

      act(() => {
        result.current.updateNote(initialNote.id, {
          title: "Updated Title",
          content: "Updated Content",
          tags: ["tag1"],
        });
      });

      const updated = result.current.notes.find((n) => n.id === initialNote.id);
      expect(updated?.title).toBe("Updated Title");
      expect(updated?.content).toBe("Updated Content");
      expect(updated?.tags).toEqual(["tag1"]);
      expect(updated?.color).toBe("#22c55e"); // unchanged
    });

    it("should do nothing if note ID is not found", () => {
      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.createNote();
      });

      const initialNotes = [...result.current.notes];

      act(() => {
        result.current.updateNote("non-existent-id", { title: "New Title" });
      });

      expect(result.current.notes).toEqual(initialNotes);
    });
  });

  describe("softDelete and restoreNote", () => {
    it("should move note to trashedNotes on softDelete and back to activeNotes on restoreNote", () => {
      const { result } = renderHook(() => useNotes());

      let note: Note;
      act(() => {
        note = result.current.createNote();
      });

      expect(result.current.activeNotes.length).toBe(1);
      expect(result.current.trashedNotes.length).toBe(0);

      act(() => {
        result.current.softDelete(note.id);
      });

      expect(result.current.notes[0].deleted).toBe(true);
      expect(result.current.activeNotes.length).toBe(0);
      expect(result.current.trashedNotes.length).toBe(1);
      expect(result.current.trashedNotes[0].id).toBe(note.id);

      act(() => {
        result.current.restoreNote(note.id);
      });

      expect(result.current.notes[0].deleted).toBe(false);
      expect(result.current.activeNotes.length).toBe(1);
      expect(result.current.trashedNotes.length).toBe(0);
    });
  });

  describe("permanentDelete and emptyTrash", () => {
    it("should remove specified note permanently with permanentDelete", () => {
      const { result } = renderHook(() => useNotes());

      let note1: Note, note2: Note;
      act(() => {
        note1 = result.current.createNote();
        note2 = result.current.createNote();
      });

      expect(result.current.notes.length).toBe(2);

      act(() => {
        result.current.permanentDelete(note1.id);
      });

      expect(result.current.notes.length).toBe(1);
      expect(result.current.notes[0].id).toBe(note2.id);
    });

    it("should remove all deleted notes when calling emptyTrash", () => {
      const { result } = renderHook(() => useNotes());

      let note1: Note, note2: Note, note3: Note;
      act(() => {
        note1 = result.current.createNote();
        note2 = result.current.createNote();
        note3 = result.current.createNote();
      });

      act(() => {
        result.current.softDelete(note1.id);
        result.current.softDelete(note3.id);
      });

      expect(result.current.activeNotes.length).toBe(1);
      expect(result.current.trashedNotes.length).toBe(2);

      act(() => {
        result.current.emptyTrash();
      });

      expect(result.current.notes.length).toBe(1);
      expect(result.current.notes[0].id).toBe(note2.id);
      expect(result.current.trashedNotes.length).toBe(0);
    });
  });

  describe("importNotes", () => {
    it("should import new notes and merge existing notes if incoming version is newer", () => {
      const { result } = renderHook(() => useNotes());

      const initialNote: Note = {
        id: "existing-1",
        title: "Old Title",
        content: "Old Content",
        tags: [],
        color: "#22c55e",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deleted: false,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([initialNote]));

      const { result: hookResult } = renderHook(() => useNotes());

      const incomingNotes: Note[] = [
        {
          id: "existing-1",
          title: "Newer Imported Title",
          content: "Updated Content",
          tags: ["imported"],
          color: "#22c55e",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
          deleted: false,
        },
        {
          id: "brand-new-2",
          title: "Brand New Note",
          content: "Fresh",
          tags: [],
          color: "#3b82f6",
          createdAt: "2025-01-02T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
          deleted: false,
        },
      ];

      act(() => {
        hookResult.current.importNotes(incomingNotes);
      });

      expect(hookResult.current.notes.length).toBe(2);
      const mergedExisting = hookResult.current.notes.find((n) => n.id === "existing-1");
      expect(mergedExisting?.title).toBe("Newer Imported Title");

      const brandNew = hookResult.current.notes.find((n) => n.id === "brand-new-2");
      expect(brandNew?.title).toBe("Brand New Note");
    });

    it("should not overwrite existing note if incoming note updatedAt is older", () => {
      const existingNote: Note = {
        id: "existing-1",
        title: "Newer Existing Title",
        content: "Content",
        tags: [],
        color: "#22c55e",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-05T00:00:00.000Z",
        deleted: false,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([existingNote]));

      const { result } = renderHook(() => useNotes());

      const olderIncomingNotes: Note[] = [
        {
          id: "existing-1",
          title: "Older Incoming Title",
          content: "Old Content",
          tags: [],
          color: "#22c55e",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
          deleted: false,
        },
      ];

      act(() => {
        result.current.importNotes(olderIncomingNotes);
      });

      expect(result.current.notes[0].title).toBe("Newer Existing Title");
    });
  });

  describe("exportNotes", () => {
    it("should trigger file download with serialized notes json", () => {
      const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      const { result } = renderHook(() => useNotes());

      act(() => {
        result.current.createNote();
      });

      act(() => {
        result.current.exportNotes();
      });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-url");

      clickSpy.mockRestore();
    });
  });

  describe("activeNotes & trashedNotes sorting", () => {
    it("should sort activeNotes and trashedNotes by updatedAt descending", () => {
      const note1: Note = {
        id: "1",
        title: "Older Note",
        content: "",
        tags: [],
        color: "#22c55e",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        deleted: false,
      };

      const note2: Note = {
        id: "2",
        title: "Newer Note",
        content: "",
        tags: [],
        color: "#22c55e",
        createdAt: "2025-01-02T00:00:00.000Z",
        updatedAt: "2025-01-02T00:00:00.000Z",
        deleted: false,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([note1, note2]));

      const { result: loadedResult } = renderHook(() => useNotes());

      expect(loadedResult.current.activeNotes[0].id).toBe("2");
      expect(loadedResult.current.activeNotes[1].id).toBe("1");
    });
  });
});
