import { describe, it, expect, beforeEach } from "vitest";
import { getPieces, Piece } from "./storage";

describe("storage utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getPieces", () => {
    it("should return an empty array when localStorage has no data for pieces", () => {
      const pieces = getPieces();
      expect(pieces).toEqual([]);
    });

    it("should return parsed array of pieces when valid JSON is present in localStorage", () => {
      const mockPieces: Piece[] = [
        {
          id: "piece-1",
          title: "Moonlight Sonata",
          composer: "Beethoven",
          instrument: "Piano",
          difficulty: "Advanced",
          targetBPM: 140,
          currentBPM: 120,
          status: "active",
          dateAdded: "2025-01-01",
          dateMastered: null,
          color: "#ff0000",
          tags: ["classical", "piano"],
        },
      ];

      localStorage.setItem("mpl_pieces", JSON.stringify(mockPieces));

      const pieces = getPieces();
      expect(pieces).toEqual(mockPieces);
      expect(pieces).toHaveLength(1);
      expect(pieces[0].title).toBe("Moonlight Sonata");
    });

    it("should return an empty array fallback when localStorage contains invalid JSON", () => {
      localStorage.setItem("mpl_pieces", "invalid-json-{");

      const pieces = getPieces();
      expect(pieces).toEqual([]);
    });
  });
});
