import { describe, it, expect } from "vitest";
import {
  generateId,
  getDestinationEmoji,
  getTripStatus,
  getDaysUntil,
  getTripDuration,
  getPackingProgress,
  formatDate,
  formatDateShort,
  formatDayHeader,
  generateItinerary,
  getActivityIcon,
  getPackingTemplate,
  PRESET_CATEGORY_COLORS,
} from "@/lib/tripUtils";
import { Trip } from "@/types/trip";

describe("tripUtils - getDestinationEmoji", () => {
  it("returns beach emoji for beach destinations", () => {
    expect(getDestinationEmoji("Miami Beach")).toBe("🏖️");
    expect(getDestinationEmoji("Trip to Bali")).toBe("🏖️");
    expect(getDestinationEmoji("HAWAII 2025")).toBe("🏖️");
    expect(getDestinationEmoji("Maldives Resort")).toBe("🏖️");
  });

  it("returns Paris emoji for Paris/France", () => {
    expect(getDestinationEmoji("Paris")).toBe("🗼");
    expect(getDestinationEmoji("South of France")).toBe("🗼");
  });

  it("returns Japan emoji for Japan/Tokyo/Kyoto", () => {
    expect(getDestinationEmoji("Japan")).toBe("🗾");
    expect(getDestinationEmoji("Tokyo Trip")).toBe("🗾");
    expect(getDestinationEmoji("Kyoto Garden Tour")).toBe("🗾");
  });

  it("returns UK emoji for London/UK/England", () => {
    expect(getDestinationEmoji("London")).toBe("🇬🇧");
    expect(getDestinationEmoji("UK Vacation")).toBe("🇬🇧");
    expect(getDestinationEmoji("England Tour")).toBe("🇬🇧");
  });

  it("returns NYC emoji for New York/NYC", () => {
    expect(getDestinationEmoji("New York City")).toBe("🗽");
    expect(getDestinationEmoji("NYC Weekend")).toBe("🗽");
  });

  it("returns Rome emoji for Rome/Italy", () => {
    expect(getDestinationEmoji("Rome")).toBe("🏛️");
    expect(getDestinationEmoji("Italy Vacation")).toBe("🏛️");
  });

  it("returns mountain emoji for Mountain/Alps/Nepal", () => {
    expect(getDestinationEmoji("Rocky Mountains")).toBe("🏔️");
    expect(getDestinationEmoji("Swiss Alps")).toBe("🏔️");
    expect(getDestinationEmoji("Nepal Trekking")).toBe("🏔️");
  });

  it("returns Australia emoji for Australia/Sydney", () => {
    expect(getDestinationEmoji("Australia")).toBe("🦘");
    expect(getDestinationEmoji("Sydney Harbor")).toBe("🦘");
  });

  it("returns India emoji for India", () => {
    expect(getDestinationEmoji("India")).toBe("🇮🇳");
  });

  it("returns China emoji for China/Beijing", () => {
    expect(getDestinationEmoji("China")).toBe("🇨🇳");
    expect(getDestinationEmoji("Beijing")).toBe("🇨🇳");
  });

  it("returns Egypt emoji for Egypt/Cairo", () => {
    expect(getDestinationEmoji("Egypt")).toBe("🏺");
    expect(getDestinationEmoji("Cairo Tour")).toBe("🏺");
  });

  it("returns Lion emoji for Safari/Kenya/Africa", () => {
    expect(getDestinationEmoji("Safari Trip")).toBe("🦁");
    expect(getDestinationEmoji("Kenya")).toBe("🦁");
    expect(getDestinationEmoji("South Africa")).toBe("🦁");
  });

  it("returns Cruise emoji for Cruise/Caribbean", () => {
    expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
    expect(getDestinationEmoji("Disney Cruise")).toBe("🚢");
  });

  it("returns Camping emoji for Camping", () => {
    expect(getDestinationEmoji("Camping in Yosemite")).toBe("⛺");
  });

  it("returns default plane emoji for unknown destinations", () => {
    expect(getDestinationEmoji("Unknown City")).toBe("✈️");
    expect(getDestinationEmoji("Berlin")).toBe("✈️");
    expect(getDestinationEmoji("")).toBe("✈️");
  });
});

describe("tripUtils - other utilities", () => {
  it("generateId produces non-empty string IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeTruthy();
    expect(typeof id1).toBe("string");
    expect(id1).not.toBe(id2);
  });

  it("getTripStatus calculates UPCOMING, ONGOING, and COMPLETED correctly", () => {
    const today = new Date();
    const pastStart = new Date(today.getTime() - 10 * 86400000).toISOString().split("T")[0];
    const pastEnd = new Date(today.getTime() - 5 * 86400000).toISOString().split("T")[0];

    const futureStart = new Date(today.getTime() + 5 * 86400000).toISOString().split("T")[0];
    const futureEnd = new Date(today.getTime() + 10 * 86400000).toISOString().split("T")[0];

    const ongoingStart = new Date(today.getTime() - 2 * 86400000).toISOString().split("T")[0];
    const ongoingEnd = new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0];

    const baseTrip: Omit<Trip, "startDate" | "endDate"> = {
      id: "1",
      destination: "Test",
      title: "Test Trip",
      packingCategories: [],
      itinerary: [],
      notes: "",
      budget: { total: 0, expenses: [] },
    };

    expect(getTripStatus({ ...baseTrip, startDate: pastStart, endDate: pastEnd })).toBe("COMPLETED");
    expect(getTripStatus({ ...baseTrip, startDate: futureStart, endDate: futureEnd })).toBe("UPCOMING");
    expect(getTripStatus({ ...baseTrip, startDate: ongoingStart, endDate: ongoingEnd })).toBe("ONGOING");
  });

  it("getDaysUntil formats readable duration status string", () => {
    const today = new Date();
    const futureStart = new Date(today.getTime() + 5 * 86400000).toISOString().split("T")[0];
    const futureEnd = new Date(today.getTime() + 10 * 86400000).toISOString().split("T")[0];

    const pastStart = new Date(today.getTime() - 10 * 86400000).toISOString().split("T")[0];
    const pastEnd = new Date(today.getTime() - 5 * 86400000).toISOString().split("T")[0];

    const baseTrip: Omit<Trip, "startDate" | "endDate"> = {
      id: "1",
      destination: "Test",
      title: "Test Trip",
      packingCategories: [],
      itinerary: [],
      notes: "",
      budget: { total: 0, expenses: [] },
    };

    expect(getDaysUntil({ ...baseTrip, startDate: futureStart, endDate: futureEnd })).toContain("days until departure");
    expect(getDaysUntil({ ...baseTrip, startDate: pastStart, endDate: pastEnd })).toBe("Trip completed");
  });

  it("getTripDuration calculates duration in days", () => {
    const trip: Trip = {
      id: "1",
      destination: "Paris",
      title: "Paris Trip",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
      packingCategories: [],
      itinerary: [],
      notes: "",
      budget: { total: 0, expenses: [] },
    };
    expect(getTripDuration(trip)).toBe(5);
  });

  it("getPackingProgress calculates packed and total items correctly", () => {
    const trip: Trip = {
      id: "1",
      destination: "Rome",
      title: "Rome Trip",
      startDate: "2025-06-01",
      endDate: "2025-06-05",
      packingCategories: [
        {
          id: "c1",
          name: "Category 1",
          color: "#fff",
          items: [
            { id: "i1", name: "Item 1", quantity: 1, packed: true, essential: true },
            { id: "i2", name: "Item 2", quantity: 1, packed: false, essential: true },
          ],
        },
      ],
      itinerary: [],
      notes: "",
      budget: { total: 0, expenses: [] },
    };
    expect(getPackingProgress(trip)).toEqual({ packed: 1, total: 2 });
  });

  it("formatDate, formatDateShort, formatDayHeader format ISO dates properly", () => {
    const isoDate = "2025-07-15T00:00:00.000Z";
    expect(formatDate(isoDate)).toMatch(/2025/);
    expect(formatDateShort(isoDate)).toMatch(/Jul/);
    expect(formatDayHeader(isoDate)).toMatch(/July 15/);
  });

  it("generateItinerary builds array of DayPlan objects for date range", () => {
    const itinerary = generateItinerary("2025-08-01", "2025-08-03");
    expect(itinerary).toHaveLength(3);
    expect(itinerary[0].date).toBe("2025-08-01");
    expect(itinerary[2].date).toBe("2025-08-03");
  });

  it("getActivityIcon returns correct icons for activity types", () => {
    expect(getActivityIcon("food")).toBe("🍽️");
    expect(getActivityIcon("transport")).toBe("🚗");
    expect(getActivityIcon("activity")).toBe("🎭");
    expect(getActivityIcon("hotel")).toBe("🏨");
    expect(getActivityIcon("other")).toBe("📌");
  });

  it("getPackingTemplate returns template or default template with generated IDs", () => {
    const beachTemplate = getPackingTemplate("beach");
    expect(beachTemplate.length).toBeGreaterThan(0);
    expect(beachTemplate[0].id).toBeTruthy();
    expect(beachTemplate[0].items[0].id).toBeTruthy();

    const fallbackTemplate = getPackingTemplate("non-existent-template");
    expect(fallbackTemplate.length).toBeGreaterThan(0);
  });

  it("PRESET_CATEGORY_COLORS is defined", () => {
    expect(PRESET_CATEGORY_COLORS.length).toBeGreaterThan(0);
  });
});
