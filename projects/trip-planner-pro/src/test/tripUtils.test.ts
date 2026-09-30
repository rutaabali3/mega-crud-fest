import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  generateId,
  getDestinationEmoji,
  getTripStatus,
  getDaysUntil,
} from "../lib/tripUtils";
import { Trip } from "../types/trip";

const createMockTrip = (startDate: string, endDate: string): Trip => ({
  id: "test-id",
  destination: "Tokyo",
  coverEmoji: "🗾",
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
  describe("generateId", () => {
    it("returns a non-empty string", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("generates unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("getDestinationEmoji", () => {
    it("returns specific emoji for matching destinations", () => {
      expect(getDestinationEmoji("Sunny Beach")).toBe("🏖️");
      expect(getDestinationEmoji("Paris, France")).toBe("🗼");
      expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
      expect(getDestinationEmoji("London UK")).toBe("🇬🇧");
      expect(getDestinationEmoji("NYC")).toBe("🗽");
      expect(getDestinationEmoji("Rome, Italy")).toBe("🏛️");
      expect(getDestinationEmoji("Swiss Alps Mountain")).toBe("🏔️");
      expect(getDestinationEmoji("Sydney, Australia")).toBe("🦘");
      expect(getDestinationEmoji("New Delhi, India")).toBe("🇮🇳");
      expect(getDestinationEmoji("Beijing, China")).toBe("🇨🇳");
      expect(getDestinationEmoji("Cairo, Egypt")).toBe("🏺");
      expect(getDestinationEmoji("Kenya Safari")).toBe("🦁");
      expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
      expect(getDestinationEmoji("Camping in Woods")).toBe("⛺");
    });

    it("returns default plane emoji for unknown destinations", () => {
      expect(getDestinationEmoji("Unknown City")).toBe("✈️");
    });
  });

  describe("getTripStatus and getDaysUntil with fixed system time", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set current date to June 15, 2025 00:00:00 UTC
      vi.setSystemTime(new Date("2025-06-15T00:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe("getTripStatus", () => {
      it("returns UPCOMING when current date is before startDate", () => {
        const trip = createMockTrip("2025-06-20", "2025-06-25");
        expect(getTripStatus(trip)).toBe("UPCOMING");
      });

      it("returns ONGOING when current date is between startDate and endDate", () => {
        const trip = createMockTrip("2025-06-10", "2025-06-20");
        expect(getTripStatus(trip)).toBe("ONGOING");
      });

      it("returns ONGOING when current date is exactly startDate or endDate", () => {
        const tripOnStart = createMockTrip("2025-06-15", "2025-06-20");
        expect(getTripStatus(tripOnStart)).toBe("ONGOING");

        const tripOnEnd = createMockTrip("2025-06-10", "2025-06-15");
        expect(getTripStatus(tripOnEnd)).toBe("ONGOING");
      });

      it("returns COMPLETED when current date is after endDate", () => {
        const trip = createMockTrip("2025-06-01", "2025-06-10");
        expect(getTripStatus(trip)).toBe("COMPLETED");
      });
    });

    describe("getDaysUntil", () => {
      it("returns days until departure for UPCOMING trip", () => {
        const tripSingleDay = createMockTrip("2025-06-16", "2025-06-20");
        expect(getDaysUntil(tripSingleDay)).toBe("1 day until departure");

        const tripMultipleDays = createMockTrip("2025-06-20", "2025-06-25");
        expect(getDaysUntil(tripMultipleDays)).toBe("5 days until departure");
      });

      it("returns current day of total days for ONGOING trip", () => {
        const trip = createMockTrip("2025-06-10", "2025-06-20");
        expect(getDaysUntil(trip)).toBe("Day 6 of 11");
      });

      it("returns 'Trip completed' for COMPLETED trip", () => {
        const trip = createMockTrip("2025-06-01", "2025-06-10");
        expect(getDaysUntil(trip)).toBe("Trip completed");
      });
    });
  });
});
