import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getTripStatus,
  getDaysUntil,
  getTripDuration,
  getPackingProgress,
  getDestinationEmoji,
  generateItinerary,
  getPackingTemplate,
  getActivityIcon,
  formatDate,
  formatDateShort,
  formatDayHeader,
  generateId,
} from "../lib/tripUtils";
import { Trip } from "../types/trip";

const createMockTrip = (overrides?: Partial<Trip>): Trip => ({
  id: "test-trip-1",
  destination: "Paris, France",
  coverEmoji: "🗼",
  startDate: "2025-06-10",
  endDate: "2025-06-20",
  accommodation: {
    name: "Hotel Paris",
    address: "123 Rue de Paris",
    confirmationNo: "CONF123",
  },
  budget: {
    total: 2000,
    currency: "USD",
    spent: 500,
  },
  itinerary: [],
  packingCategories: [],
  expenses: [],
  notes: "Sample notes",
  createdAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

describe("getTripStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns UPCOMING when current date is before start date", () => {
    vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getTripStatus(trip)).toBe("UPCOMING");
  });

  it("returns ONGOING on the exact start date", () => {
    vi.setSystemTime(new Date("2025-06-10T08:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getTripStatus(trip)).toBe("ONGOING");
  });

  it("returns ONGOING mid-way through the trip", () => {
    vi.setSystemTime(new Date("2025-06-15T15:30:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getTripStatus(trip)).toBe("ONGOING");
  });

  it("returns ONGOING on the exact end date", () => {
    vi.setSystemTime(new Date("2025-06-20T23:59:59Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getTripStatus(trip)).toBe("ONGOING");
  });

  it("returns COMPLETED after the end date", () => {
    vi.setSystemTime(new Date("2025-06-21T00:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getTripStatus(trip)).toBe("COMPLETED");
  });

  it("correctly handles same-day trips", () => {
    const singleDayTrip = createMockTrip({
      startDate: "2025-07-04",
      endDate: "2025-07-04",
    });

    vi.setSystemTime(new Date("2025-07-03T23:59:59Z"));
    expect(getTripStatus(singleDayTrip)).toBe("UPCOMING");

    vi.setSystemTime(new Date("2025-07-04T12:00:00Z"));
    expect(getTripStatus(singleDayTrip)).toBe("ONGOING");

    vi.setSystemTime(new Date("2025-07-05T00:00:00Z"));
    expect(getTripStatus(singleDayTrip)).toBe("COMPLETED");
  });

  it("handles ISO timestamps for start and end dates", () => {
    vi.setSystemTime(new Date("2025-06-15T00:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10T10:00:00.000Z",
      endDate: "2025-06-20T18:00:00.000Z",
    });

    expect(getTripStatus(trip)).toBe("ONGOING");
  });
});

describe("getDaysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns days countdown for UPCOMING trip with plural days", () => {
    vi.setSystemTime(new Date("2025-06-05T00:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getDaysUntil(trip)).toBe("5 days until departure");
  });

  it("returns days countdown with singular day when 1 day remaining", () => {
    vi.setSystemTime(new Date("2025-06-09T00:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getDaysUntil(trip)).toBe("1 day until departure");
  });

  it("returns day progress for ONGOING trip", () => {
    vi.setSystemTime(new Date("2025-06-10T00:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getDaysUntil(trip)).toBe("Day 1 of 11");

    vi.setSystemTime(new Date("2025-06-15T00:00:00Z"));
    expect(getDaysUntil(trip)).toBe("Day 6 of 11");
  });

  it("returns completed status for COMPLETED trip", () => {
    vi.setSystemTime(new Date("2025-06-25T00:00:00Z"));
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });

    expect(getDaysUntil(trip)).toBe("Trip completed");
  });
});

describe("getTripDuration", () => {
  it("calculates total duration inclusive of start and end date", () => {
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-20",
    });
    expect(getTripDuration(trip)).toBe(11);
  });

  it("returns 1 for a single day trip", () => {
    const trip = createMockTrip({
      startDate: "2025-06-10",
      endDate: "2025-06-10",
    });
    expect(getTripDuration(trip)).toBe(1);
  });
});

describe("getPackingProgress", () => {
  it("returns zero counts when trip has no packing categories", () => {
    const trip = createMockTrip({ packingCategories: [] });
    expect(getPackingProgress(trip)).toEqual({ packed: 0, total: 0 });
  });

  it("calculates packed and total items correctly", () => {
    const trip = createMockTrip({
      packingCategories: [
        {
          id: "cat-1",
          name: "Clothing",
          color: "#3b82f6",
          items: [
            { id: "item-1", name: "Shirt", quantity: 2, packed: true, essential: true },
            { id: "item-2", name: "Pants", quantity: 1, packed: false, essential: true },
          ],
        },
        {
          id: "cat-2",
          name: "Toiletries",
          color: "#10b981",
          items: [
            { id: "item-3", name: "Toothbrush", quantity: 1, packed: true, essential: true },
          ],
        },
      ],
    });

    expect(getPackingProgress(trip)).toEqual({ packed: 2, total: 3 });
  });
});

describe("getDestinationEmoji", () => {
  it("returns specific destination emojis based on keywords", () => {
    expect(getDestinationEmoji("Bali Beach Resort")).toBe("🏖️");
    expect(getDestinationEmoji("Paris, France")).toBe("🗼");
    expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
    expect(getDestinationEmoji("London, UK")).toBe("🇬🇧");
    expect(getDestinationEmoji("New York City")).toBe("🗽");
    expect(getDestinationEmoji("Rome, Italy")).toBe("🏛️");
    expect(getDestinationEmoji("Swiss Alps Mountain")).toBe("🏔️");
    expect(getDestinationEmoji("Sydney, Australia")).toBe("🦘");
    expect(getDestinationEmoji("Delhi, India")).toBe("🇮🇳");
    expect(getDestinationEmoji("Beijing, China")).toBe("🇨🇳");
    expect(getDestinationEmoji("Cairo, Egypt")).toBe("🏺");
    expect(getDestinationEmoji("Kenya Safari")).toBe("🦁");
    expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
    expect(getDestinationEmoji("Yosemite Camping")).toBe("⛺");
  });

  it("returns default airplane emoji for unknown destinations", () => {
    expect(getDestinationEmoji("Random Unknown Location")).toBe("✈️");
  });
});

describe("formatDate functions", () => {
  it("formatDate formats ISO string to full month day year", () => {
    const formatted = formatDate("2025-06-15");
    expect(formatted).toContain("June 15, 2025");
  });

  it("formatDateShort formats ISO string to short month and day", () => {
    const formatted = formatDateShort("2025-06-15");
    expect(formatted).toContain("Jun 15");
  });

  it("formatDayHeader formats ISO string to long weekday, month and day", () => {
    const formatted = formatDayHeader("2025-06-15");
    expect(formatted).toContain("June 15");
  });
});

describe("generateItinerary", () => {
  it("generates an array of day plans for date range", () => {
    const itinerary = generateItinerary("2025-06-10", "2025-06-12");
    expect(itinerary).toHaveLength(3);
    expect(itinerary[0].date).toBe("2025-06-10");
    expect(itinerary[1].date).toBe("2025-06-11");
    expect(itinerary[2].date).toBe("2025-06-12");
    expect(itinerary[0].activities).toEqual([]);
  });
});

describe("getActivityIcon", () => {
  it("returns matching emoji for activity types", () => {
    expect(getActivityIcon("food")).toBe("🍽️");
    expect(getActivityIcon("transport")).toBe("🚗");
    expect(getActivityIcon("activity")).toBe("🎭");
    expect(getActivityIcon("hotel")).toBe("🏨");
    expect(getActivityIcon("other")).toBe("📌");
    expect(getActivityIcon("unknown")).toBe("📌");
  });
});

describe("getPackingTemplate", () => {
  it("returns default template when key is unknown", () => {
    const template = getPackingTemplate("nonexistent");
    expect(template.length).toBeGreaterThan(0);
    expect(template[0].id).toBeTruthy();
    expect(template[0].items[0].id).toBeTruthy();
  });

  it("returns specific preset template when key matches", () => {
    const beachTemplate = getPackingTemplate("beach");
    expect(beachTemplate.some((c) => c.name === "Beachwear")).toBe(true);

    const mountainTemplate = getPackingTemplate("mountain");
    expect(mountainTemplate.some((c) => c.name === "Hiking Gear")).toBe(true);
  });
});

describe("generateId", () => {
  it("generates a unique string ID", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });
});
