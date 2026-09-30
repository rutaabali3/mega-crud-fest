import { describe, it, expect } from "vitest";
import { getTripDuration, generateId, getDestinationEmoji, getPackingProgress } from "@/lib/tripUtils";
import { Trip } from "@/types/trip";

const createMockTrip = (overrides?: Partial<Trip>): Trip => ({
  id: "test-trip-id",
  destination: "Paris",
  coverEmoji: "🗼",
  startDate: "2025-06-01",
  endDate: "2025-06-05",
  accommodation: { name: "Hotel", address: "123 Street", confirmationNo: "ABC123" },
  budget: { total: 1000, currency: "USD", spent: 200 },
  itinerary: [],
  packingCategories: [],
  expenses: [],
  notes: "",
  createdAt: "2025-01-01",
  ...overrides,
});

describe("getTripDuration", () => {
  it("calculates 1 day duration for same start and end date", () => {
    const trip = createMockTrip({
      startDate: "2025-06-01",
      endDate: "2025-06-01",
    });
    expect(getTripDuration(trip)).toBe(1);
  });

  it("calculates correct multi-day duration", () => {
    const trip = createMockTrip({
      startDate: "2025-06-01",
      endDate: "2025-06-05",
    });
    expect(getTripDuration(trip)).toBe(5);
  });

  it("calculates correct duration across month and year boundaries", () => {
    const trip = createMockTrip({
      startDate: "2025-12-31",
      endDate: "2026-01-02",
    });
    expect(getTripDuration(trip)).toBe(3);
  });
});

describe("generateId", () => {
  it("returns a non-empty string ID", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});

describe("getDestinationEmoji", () => {
  it("returns corresponding emoji for destination keywords", () => {
    expect(getDestinationEmoji("Paris, France")).toBe("🗼");
    expect(getDestinationEmoji("Miami Beach")).toBe("🏖️");
    expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
  });

  it("returns default airplane emoji for unknown destinations", () => {
    expect(getDestinationEmoji("Random City")).toBe("✈️");
  });
});

describe("getPackingProgress", () => {
  it("returns zero progress when there are no items", () => {
    const trip = createMockTrip({ packingCategories: [] });
    expect(getPackingProgress(trip)).toEqual({ packed: 0, total: 0 });
  });

  it("correctly counts packed and total items across categories", () => {
    const trip = createMockTrip({
      packingCategories: [
        {
          id: "cat1",
          name: "Clothes",
          color: "#fff",
          items: [
            { id: "1", name: "Shirt", quantity: 2, packed: true, essential: true },
            { id: "2", name: "Pants", quantity: 1, packed: false, essential: true },
          ],
        },
        {
          id: "cat2",
          name: "Tech",
          color: "#000",
          items: [
            { id: "3", name: "Charger", quantity: 1, packed: true, essential: true },
          ],
        },
      ],
    });
    expect(getPackingProgress(trip)).toEqual({ packed: 2, total: 3 });
  });
});
