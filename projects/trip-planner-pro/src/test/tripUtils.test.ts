import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort, formatDayHeader } from "@/lib/tripUtils";

describe("tripUtils date formatting functions", () => {
  describe("formatDate", () => {
    it("formats an ISO date string to full month, day, and year in en-US", () => {
      const iso = "2025-06-15T12:00:00Z";
      expect(formatDate(iso)).toBe("June 15, 2025");
    });

    it("handles end of year dates correctly", () => {
      const iso = "2024-12-31T12:00:00Z";
      expect(formatDate(iso)).toBe("December 31, 2024");
    });

    it("handles leap year dates correctly", () => {
      const iso = "2024-02-29T12:00:00Z";
      expect(formatDate(iso)).toBe("February 29, 2024");
    });
  });

  describe("formatDateShort", () => {
    it("formats an ISO date string to short month and day in en-US", () => {
      const iso = "2025-06-15T12:00:00Z";
      expect(formatDateShort(iso)).toBe("Jun 15");
    });

    it("formats start of year date correctly in short format", () => {
      const iso = "2025-01-01T12:00:00Z";
      expect(formatDateShort(iso)).toBe("Jan 1");
    });
  });

  describe("formatDayHeader", () => {
    it("formats an ISO date string with weekday, month, and day in en-US", () => {
      const iso = "2025-06-15T12:00:00Z";
      expect(formatDayHeader(iso)).toBe("Sunday, June 15");
    });

    it("formats a weekday correctly for another day of the week", () => {
      const iso = "2025-06-16T12:00:00Z";
      expect(formatDayHeader(iso)).toBe("Monday, June 16");
    });
  });
});
