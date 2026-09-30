import { describe, it, expect } from "vitest";
import {
  getPackingProgress,
  getTripDuration,
  formatDate,
  generateId,
  getDestinationEmoji,
} from "../lib/tripUtils";
import { Trip } from "../types/trip";

function createMockTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    destination: "Paris",
    coverEmoji: "🗼",
    startDate: "2025-06-01",
    endDate: "2025-06-10",
    accommodation: {
      name: "Hotel Paris",
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
    notes: "",
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("tripUtils", () => {
  describe("getPackingProgress", () => {
    it("returns correct count when all items are packed", () => {
      const trip = createMockTrip({
        packingCategories: [
          {
            id: "cat-1",
            name: "Clothing",
            color: "#3b82f6",
            items: [
              { id: "i1", name: "Shirts", quantity: 2, packed: true, essential: true },
              { id: "i2", name: "Pants", quantity: 1, packed: true, essential: true },
            ],
          },
          {
            id: "cat-2",
            name: "Electronics",
            color: "#8b5cf6",
            items: [
              { id: "i3", name: "Charger", quantity: 1, packed: true, essential: true },
            ],
          },
        ],
      });

      const progress = getPackingProgress(trip);
      expect(progress).toEqual({ packed: 3, total: 3 });
      expect(progress.packed).toBe(progress.total);
    });

    it("returns correct count when partially packed", () => {
      const trip = createMockTrip({
        packingCategories: [
          {
            id: "cat-1",
            name: "Clothing",
            color: "#3b82f6",
            items: [
              { id: "i1", name: "Shirts", quantity: 2, packed: true, essential: true },
              { id: "i2", name: "Pants", quantity: 1, packed: false, essential: true },
            ],
          },
        ],
      });

      const progress = getPackingProgress(trip);
      expect(progress).toEqual({ packed: 1, total: 2 });
    });

    it("returns 0 packed and 0 total when categories or items are empty", () => {
      const emptyTrip = createMockTrip({ packingCategories: [] });
      expect(getPackingProgress(emptyTrip)).toEqual({ packed: 0, total: 0 });

      const tripWithEmptyCat = createMockTrip({
        packingCategories: [{ id: "cat-1", name: "Empty", color: "#3b82f6", items: [] }],
      });
      expect(getPackingProgress(tripWithEmptyCat)).toEqual({ packed: 0, total: 0 });
    });
  });

  describe("getTripDuration", () => {
    it("calculates trip duration in days correctly", () => {
      const trip = createMockTrip({
        startDate: "2025-06-01",
        endDate: "2025-06-10",
      });
      expect(getTripDuration(trip)).toBe(10);
    });

    it("returns 1 for same-day start and end dates", () => {
      const trip = createMockTrip({
        startDate: "2025-06-01",
        endDate: "2025-06-01",
      });
      expect(getTripDuration(trip)).toBe(1);
    });
  });

  describe("formatDate", () => {
    it("formats ISO date string into long date format", () => {
      const formatted = formatDate("2025-06-01");
      expect(formatted).toContain("2025");
      expect(formatted).toContain("June");
    });
  });

  describe("generateId", () => {
    it("generates a non-empty string ID", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("getDestinationEmoji", () => {
    it("returns specific emoji for known destinations", () => {
      expect(getDestinationEmoji("Hawaii Beach")).toBe("🏖️");
      expect(getDestinationEmoji("Paris")).toBe("🗼");
      expect(getDestinationEmoji("Tokyo Japan")).toBe("🗾");
    });

    it("returns default plane emoji for unknown destinations", () => {
      expect(getDestinationEmoji("Somewhere Unknown")).toBe("✈️");
    });
  });
});
