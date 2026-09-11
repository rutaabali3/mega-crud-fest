import { describe, it, expect } from "vitest";
import {
  toISODate,
  toISODateTime,
  combineDateAndTime,
  formatTime,
  generateId,
} from "../utils/dateHelpers";

describe("dateHelpers", () => {
  describe("toISODate", () => {
    it("should format a standard date to YYYY-MM-DD", () => {
      const date = new Date(2025, 4, 15); // May 15, 2025
      expect(toISODate(date)).toBe("2025-05-15");
    });

    it("should pad single digit month and day with leading zeroes", () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      expect(toISODate(date)).toBe("2025-01-05");
    });

    it("should correctly handle leap years (Feb 29)", () => {
      const date = new Date(2024, 1, 29); // February 29, 2024
      expect(toISODate(date)).toBe("2024-02-29");
    });

    it("should handle year end boundary date", () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      expect(toISODate(date)).toBe("2025-12-31");
    });
  });

  describe("toISODateTime", () => {
    it("should return the full ISO 8601 string representation of a date", () => {
      const date = new Date("2025-05-15T10:30:00.000Z");
      expect(toISODateTime(date)).toBe("2025-05-15T10:30:00.000Z");
    });
  });

  describe("combineDateAndTime", () => {
    it("should combine date and time strings into a valid ISO string", () => {
      const result = combineDateAndTime("2025-05-15", "14:30");
      expect(result).toBe(new Date("2025-05-15T14:30:00").toISOString());
    });
  });

  describe("formatTime", () => {
    it("should format morning time correctly (AM)", () => {
      expect(formatTime("09:05")).toBe("9:05 AM");
    });

    it("should format afternoon time correctly (PM)", () => {
      expect(formatTime("14:30")).toBe("2:30 PM");
    });

    it("should format midnight (00:00) as 12:00 AM", () => {
      expect(formatTime("00:00")).toBe("12:00 AM");
    });

    it("should format noon (12:00) as 12:00 PM", () => {
      expect(formatTime("12:00")).toBe("12:00 PM");
    });
  });

  describe("generateId", () => {
    it("should return a valid UUID v4 string", () => {
      const id = generateId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should generate unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });
});
