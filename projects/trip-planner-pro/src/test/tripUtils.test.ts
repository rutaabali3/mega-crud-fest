import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDaysUntil, getTripStatus, getDestinationEmoji, generateId } from "@/lib/tripUtils";
import { Trip } from "@/types/trip";

const createMockTrip = (startDate: string, endDate: string, destination = "Paris"): Trip => ({
  id: "trip-1",
  destination,
  coverEmoji: "✈️",
  startDate,
  endDate,
  accommodation: { name: "Hotel", address: "123 St", confirmationNo: "ABC" },
  budget: { total: 1000, currency: "USD", spent: 0 },
  itinerary: [],
  packingCategories: [],
  expenses: [],
  notes: "",
  createdAt: "2025-01-01",
});

describe("tripUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getDaysUntil", () => {
    it("returns '1 day until departure' when departure is tomorrow", () => {
      // Mock today as 2025-06-01 10:00:00
      vi.setSystemTime(new Date(2025, 5, 1, 10, 0, 0));
      const trip = createMockTrip("2025-06-02", "2025-06-10");

      expect(getDaysUntil(trip)).toBe("1 day until departure");
    });

    it("returns 'X days until departure' (plural) when departure is multiple days away", () => {
      vi.setSystemTime(new Date(2025, 5, 1, 10, 0, 0));
      const trip = createMockTrip("2025-06-06", "2025-06-10");

      expect(getDaysUntil(trip)).toBe("5 days until departure");
    });

    it("returns 'Day 1 of N' when trip starts today", () => {
      vi.setSystemTime(new Date(2025, 5, 1, 12, 0, 0));
      const trip = createMockTrip("2025-06-01", "2025-06-05");

      expect(getDaysUntil(trip)).toBe("Day 1 of 5");
    });

    it("returns 'Day X of N' for an ongoing trip on an intermediate day", () => {
      vi.setSystemTime(new Date(2025, 5, 3, 15, 30, 0));
      const trip = createMockTrip("2025-06-01", "2025-06-05");

      expect(getDaysUntil(trip)).toBe("Day 3 of 5");
    });

    it("returns 'Day N of N' on the final day of an ongoing trip", () => {
      vi.setSystemTime(new Date(2025, 5, 5, 20, 0, 0));
      const trip = createMockTrip("2025-06-01", "2025-06-05");

      expect(getDaysUntil(trip)).toBe("Day 5 of 5");
    });

    it("returns 'Trip completed' when current date is past end date", () => {
      vi.setSystemTime(new Date(2025, 5, 6, 0, 0, 1));
      const trip = createMockTrip("2025-06-01", "2025-06-05");

      expect(getDaysUntil(trip)).toBe("Trip completed");
    });

    it("handles single-day trips correctly when ongoing", () => {
      vi.setSystemTime(new Date(2025, 5, 1, 8, 0, 0));
      const trip = createMockTrip("2025-06-01", "2025-06-01");

      expect(getDaysUntil(trip)).toBe("Day 1 of 1");
    });
  });

  describe("getTripStatus", () => {
    it("returns UPCOMING when current date is before start date", () => {
      vi.setSystemTime(new Date(2025, 5, 1, 0, 0, 0));
      const trip = createMockTrip("2025-06-05", "2025-06-10");

      expect(getTripStatus(trip)).toBe("UPCOMING");
    });

    it("returns ONGOING when current date is within start and end date inclusive", () => {
      vi.setSystemTime(new Date(2025, 5, 5, 0, 0, 0));
      const trip = createMockTrip("2025-06-05", "2025-06-10");

      expect(getTripStatus(trip)).toBe("ONGOING");
    });

    it("returns COMPLETED when current date is after end date", () => {
      vi.setSystemTime(new Date(2025, 5, 11, 0, 0, 0));
      const trip = createMockTrip("2025-06-05", "2025-06-10");

      expect(getTripStatus(trip)).toBe("COMPLETED");
    });
  });

  describe("getDestinationEmoji", () => {
    it("returns corresponding emoji based on destination keywords", () => {
      expect(getDestinationEmoji("Miami Beach")).toBe("🏖️");
      expect(getDestinationEmoji("Trip to Paris")).toBe("🗼");
      expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
      expect(getDestinationEmoji("London City")).toBe("🇬🇧");
      expect(getDestinationEmoji("New York")).toBe("🗽");
      expect(getDestinationEmoji("Rome Italy")).toBe("🏛️");
      expect(getDestinationEmoji("Swiss Alps Mountain")).toBe("🏔️");
      expect(getDestinationEmoji("Sydney Australia")).toBe("🦘");
      expect(getDestinationEmoji("India Tour")).toBe("🇮🇳");
      expect(getDestinationEmoji("Beijing China")).toBe("🇨🇳");
      expect(getDestinationEmoji("Cairo Egypt")).toBe("🏺");
      expect(getDestinationEmoji("Kenya Safari")).toBe("🦁");
      expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
      expect(getDestinationEmoji("Grand Canyon Camping")).toBe("⛺");
      expect(getDestinationEmoji("Somewhere else")).toBe("✈️");
    });
  });

  describe("generateId", () => {
    it("generates a non-empty string ID", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(typeof id1).toBe("string");
      expect(id1).not.toBe(id2);
    });
  });
});
