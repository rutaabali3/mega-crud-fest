import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPackingProgress,
  getTripDuration,
  getTripStatus,
  getDaysUntil,
  formatDate,
  formatDateShort,
  formatDayHeader,
  getDestinationEmoji,
  generateItinerary,
  getActivityIcon,
  getPackingTemplate,
  generateId,
} from "../lib/tripUtils";
import { Trip } from "../types/trip";

const createMockTrip = (overrides?: Partial<Trip>): Trip => ({
  id: "trip-1",
  destination: "Paris",
  coverEmoji: "🗼",
  startDate: "2025-06-01",
  endDate: "2025-06-05",
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
  createdAt: "2025-01-01",
  ...overrides,
});

describe("getPackingProgress", () => {
  it("returns { packed: 0, total: 0 } when packingCategories is empty", () => {
    const trip = createMockTrip({ packingCategories: [] });
    const progress = getPackingProgress(trip);
    expect(progress).toEqual({ packed: 0, total: 0 });
  });

  it("returns { packed: 0, total: 0 } when categories have no items", () => {
    const trip = createMockTrip({
      packingCategories: [
        { id: "c1", name: "Clothing", color: "#fff", items: [] },
        { id: "c2", name: "Electronics", color: "#000", items: [] },
      ],
    });
    const progress = getPackingProgress(trip);
    expect(progress).toEqual({ packed: 0, total: 0 });
  });

  it("calculates packed and total count correctly when items are unpacked", () => {
    const trip = createMockTrip({
      packingCategories: [
        {
          id: "c1",
          name: "Clothing",
          color: "#fff",
          items: [
            { id: "i1", name: "Shirt", quantity: 1, packed: false, essential: false },
            { id: "i2", name: "Pants", quantity: 1, packed: false, essential: false },
          ],
        },
      ],
    });
    const progress = getPackingProgress(trip);
    expect(progress).toEqual({ packed: 0, total: 2 });
  });

  it("calculates packed and total count correctly when items are partially or fully packed across multiple categories", () => {
    const trip = createMockTrip({
      packingCategories: [
        {
          id: "c1",
          name: "Clothing",
          color: "#fff",
          items: [
            { id: "i1", name: "Shirt", quantity: 1, packed: true, essential: false },
            { id: "i2", name: "Pants", quantity: 1, packed: false, essential: false },
          ],
        },
        {
          id: "c2",
          name: "Electronics",
          color: "#000",
          items: [
            { id: "i3", name: "Phone Charger", quantity: 1, packed: true, essential: true },
            { id: "i4", name: "Headphones", quantity: 1, packed: true, essential: false },
          ],
        },
      ],
    });
    const progress = getPackingProgress(trip);
    expect(progress).toEqual({ packed: 3, total: 4 });
  });
});

describe("getTripDuration", () => {
  it("calculates duration in days correctly for same day", () => {
    const trip = createMockTrip({
      startDate: "2025-06-01",
      endDate: "2025-06-01",
    });
    expect(getTripDuration(trip)).toBe(1);
  });

  it("calculates duration in days correctly for multi-day trips", () => {
    const trip = createMockTrip({
      startDate: "2025-06-01",
      endDate: "2025-06-05",
    });
    expect(getTripDuration(trip)).toBe(5);
  });
});

describe("getTripStatus and getDaysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns UPCOMING status and days until departure when trip start is in future", () => {
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-15",
    });
    expect(getTripStatus(trip)).toBe("UPCOMING");
    expect(getDaysUntil(trip)).toBe("9 days until departure");
  });

  it("returns single day until departure message correctly", () => {
    const trip = createMockTrip({
      startDate: "2025-06-02",
      endDate: "2025-06-05",
    });
    expect(getTripStatus(trip)).toBe("UPCOMING");
    expect(getDaysUntil(trip)).toBe("1 day until departure");
  });

  it("returns ONGOING status and current day count when system date is within trip range", () => {
    const trip = createMockTrip({
      startDate: "2025-05-31",
      endDate: "2025-06-05",
    });
    expect(getTripStatus(trip)).toBe("ONGOING");
    expect(getDaysUntil(trip)).toBe("Day 2 of 6");
  });

  it("returns COMPLETED status and trip completed text when trip is in the past", () => {
    const trip = createMockTrip({
      startDate: "2025-05-01",
      endDate: "2025-05-10",
    });
    expect(getTripStatus(trip)).toBe("COMPLETED");
    expect(getDaysUntil(trip)).toBe("Trip completed");
  });
});

describe("date formatting functions", () => {
  it("formats date string correctly", () => {
    expect(formatDate("2025-06-01")).toContain("June 1, 2025");
    expect(formatDateShort("2025-06-01")).toContain("Jun 1");
    expect(formatDayHeader("2025-06-01")).toContain("June 1");
  });
});

describe("getDestinationEmoji", () => {
  it("returns appropriate emoji for destinations", () => {
    expect(getDestinationEmoji("Bali Beach")).toBe("🏖️");
    expect(getDestinationEmoji("Paris, France")).toBe("🗼");
    expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
    expect(getDestinationEmoji("London, UK")).toBe("🇬🇧");
    expect(getDestinationEmoji("New York")).toBe("🗽");
    expect(getDestinationEmoji("Rome")).toBe("🏛️");
    expect(getDestinationEmoji("Swiss Alps Mountain")).toBe("🏔️");
    expect(getDestinationEmoji("Sydney Australia")).toBe("🦘");
    expect(getDestinationEmoji("India")).toBe("🇮🇳");
    expect(getDestinationEmoji("Beijing China")).toBe("🇨🇳");
    expect(getDestinationEmoji("Cairo Egypt")).toBe("🏺");
    expect(getDestinationEmoji("Kenya Safari")).toBe("🦁");
    expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
    expect(getDestinationEmoji("Yosemite Camping")).toBe("⛺");
    expect(getDestinationEmoji("Unknown Place")).toBe("✈️");
  });
});

describe("generateItinerary", () => {
  it("generates day plans for each day in range inclusive", () => {
    const itinerary = generateItinerary("2025-06-01", "2025-06-03");
    expect(itinerary).toHaveLength(3);
    expect(itinerary[0].date).toBe("2025-06-01");
    expect(itinerary[1].date).toBe("2025-06-02");
    expect(itinerary[2].date).toBe("2025-06-03");
    expect(itinerary[0].activities).toEqual([]);
  });
});

describe("getActivityIcon", () => {
  it("returns correct icons for activity types", () => {
    expect(getActivityIcon("food")).toBe("🍽️");
    expect(getActivityIcon("transport")).toBe("🚗");
    expect(getActivityIcon("activity")).toBe("🎭");
    expect(getActivityIcon("hotel")).toBe("🏨");
    expect(getActivityIcon("other")).toBe("📌");
  });
});

describe("getPackingTemplate", () => {
  it("returns template categories with generated IDs", () => {
    const defaultTemplate = getPackingTemplate("default");
    expect(defaultTemplate.length).toBeGreaterThan(0);
    expect(defaultTemplate[0].id).not.toBe("");
    expect(defaultTemplate[0].items[0].id).not.toBe("");

    const beachTemplate = getPackingTemplate("beach");
    expect(beachTemplate.length).toBeGreaterThan(0);

    const unknownTemplate = getPackingTemplate("nonexistent");
    expect(unknownTemplate).toEqual(defaultTemplate.map(c => expect.objectContaining({ name: c.name })));
  });
});

describe("generateId", () => {
  it("generates a non-empty string ID", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
