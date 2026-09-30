import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getTripStatus } from "../lib/tripUtils";
import { Trip } from "../types/trip";

function createMockTrip(startDate: string, endDate: string): Trip {
  return {
    id: "test-trip-1",
    destination: "Paris",
    coverEmoji: "🗼",
    startDate,
    endDate,
    accommodation: {
      name: "Grand Hotel",
      address: "123 Rue de Paris",
      confirmationNo: "CONF123",
    },
    budget: {
      total: 1000,
      currency: "USD",
      spent: 200,
    },
    itinerary: [],
    packingCategories: [],
    expenses: [],
    notes: "Sample notes",
    createdAt: "2025-01-01",
  };
}

describe("getTripStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("same start and end date (1-day trip)", () => {
    it("returns ONGOING when current date matches the single-day trip date", () => {
      const trip = createMockTrip("2025-06-15", "2025-06-15");
      expect(getTripStatus(trip)).toBe("ONGOING");
    });

    it("returns UPCOMING when current date is before the single-day trip date", () => {
      const trip = createMockTrip("2025-06-20", "2025-06-20");
      expect(getTripStatus(trip)).toBe("UPCOMING");
    });

    it("returns COMPLETED when current date is after the single-day trip date", () => {
      const trip = createMockTrip("2025-06-10", "2025-06-10");
      expect(getTripStatus(trip)).toBe("COMPLETED");
    });
  });

  describe("multi-day trip", () => {
    it("returns UPCOMING when today is before startDate", () => {
      const trip = createMockTrip("2025-07-01", "2025-07-10");
      expect(getTripStatus(trip)).toBe("UPCOMING");
    });

    it("returns ONGOING when today is between startDate and endDate", () => {
      const trip = createMockTrip("2025-06-10", "2025-06-20");
      expect(getTripStatus(trip)).toBe("ONGOING");
    });

    it("returns COMPLETED when today is after endDate", () => {
      const trip = createMockTrip("2025-06-01", "2025-06-10");
      expect(getTripStatus(trip)).toBe("COMPLETED");
    });
  });
});
