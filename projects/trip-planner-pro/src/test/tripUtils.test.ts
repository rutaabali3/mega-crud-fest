import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
} from "../lib/tripUtils";
import { Trip } from "@/types/trip";

describe("tripUtils", () => {
  describe("generateId", () => {
    it("uses crypto.randomUUID when available", () => {
      const mockUuid = "12345678-1234-1234-1234-123456789abc";
      const originalCrypto = globalThis.crypto;

      const mockCrypto = {
        ...originalCrypto,
        randomUUID: vi.fn().mockReturnValue(mockUuid),
      };

      vi.stubGlobal("crypto", mockCrypto);

      const id = generateId();
      expect(id).toBe(mockUuid);
      expect(mockCrypto.randomUUID).toHaveBeenCalled();

      vi.stubGlobal("crypto", originalCrypto);
    });

    it("falls back when crypto or randomUUID is undefined", () => {
      const originalCrypto = globalThis.crypto;

      vi.stubGlobal("crypto", undefined);

      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);

      vi.stubGlobal("crypto", originalCrypto);
    });

    it("generates unique values across multiple calls", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("getDestinationEmoji", () => {
    it("returns correct emoji for various destination keywords", () => {
      expect(getDestinationEmoji("Sunny Beach")).toBe("🏖️");
      expect(getDestinationEmoji("Trip to Bali")).toBe("🏖️");
      expect(getDestinationEmoji("Paris, France")).toBe("🗼");
      expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
      expect(getDestinationEmoji("London, UK")).toBe("🇬🇧");
      expect(getDestinationEmoji("New York City")).toBe("🗽");
      expect(getDestinationEmoji("Rome, Italy")).toBe("🏛️");
      expect(getDestinationEmoji("Swiss Alps Mountain")).toBe("🏔️");
      expect(getDestinationEmoji("Sydney, Australia")).toBe("🦘");
      expect(getDestinationEmoji("New Delhi, India")).toBe("🇮🇳");
      expect(getDestinationEmoji("Beijing, China")).toBe("🇨🇳");
      expect(getDestinationEmoji("Cairo, Egypt")).toBe("🏺");
      expect(getDestinationEmoji("Kenya Safari, Africa")).toBe("🦁");
      expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
      expect(getDestinationEmoji("Forest Camping")).toBe("⛺");
    });

    it("is case-insensitive", () => {
      expect(getDestinationEmoji("PARIS")).toBe("🗼");
      expect(getDestinationEmoji("beACH")).toBe("🏖️");
    });

    it("returns default airplane emoji for unknown destinations", () => {
      expect(getDestinationEmoji("Unknown Place 123")).toBe("✈️");
      expect(getDestinationEmoji("")).toBe("✈️");
    });
  });

  describe("getTripStatus and getDaysUntil", () => {
    const createSampleTrip = (startDate: string, endDate: string): Trip => ({
      id: "trip-1",
      destination: "Paris",
      coverEmoji: "🗼",
      startDate,
      endDate,
      accommodation: { name: "", address: "", confirmationNo: "" },
      budget: { total: 1000, currency: "USD", spent: 0 },
      itinerary: [],
      packingCategories: [],
      expenses: [],
      notes: "",
      createdAt: "2025-01-01",
    });

    beforeEach(() => {
      vi.useFakeTimers();
      // Mock today as 2025-06-15T00:00:00.000Z
      vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("correctly identifies UPCOMING trips and formats getDaysUntil", () => {
      const trip = createSampleTrip("2025-06-20", "2025-06-25");
      expect(getTripStatus(trip)).toBe("UPCOMING");
      expect(getDaysUntil(trip)).toBe("5 days until departure");

      const tripTomorrow = createSampleTrip("2025-06-16", "2025-06-20");
      expect(getTripStatus(tripTomorrow)).toBe("UPCOMING");
      expect(getDaysUntil(tripTomorrow)).toBe("1 day until departure");
    });

    it("correctly identifies ONGOING trips and formats getDaysUntil", () => {
      const trip = createSampleTrip("2025-06-10", "2025-06-20");
      expect(getTripStatus(trip)).toBe("ONGOING");
      // Start June 10 to June 20 is 11 total days.
      // Current date June 15: Math.ceil((June 15 - June 10) / 1 day) + 1 = 6.
      expect(getDaysUntil(trip)).toBe("Day 6 of 11");
    });

    it("correctly identifies COMPLETED trips and formats getDaysUntil", () => {
      const trip = createSampleTrip("2025-06-01", "2025-06-10");
      expect(getTripStatus(trip)).toBe("COMPLETED");
      expect(getDaysUntil(trip)).toBe("Trip completed");
    });
  });

  describe("getTripDuration", () => {
    it("calculates trip duration in days inclusively", () => {
      const trip = {
        startDate: "2025-06-10",
        endDate: "2025-06-14",
      } as Trip;
      expect(getTripDuration(trip)).toBe(5);

      const singleDayTrip = {
        startDate: "2025-06-10",
        endDate: "2025-06-10",
      } as Trip;
      expect(getTripDuration(singleDayTrip)).toBe(1);
    });
  });

  describe("getPackingProgress", () => {
    it("returns correct packed and total counts", () => {
      const trip = {
        packingCategories: [
          {
            id: "cat-1",
            name: "Clothing",
            color: "#fff",
            items: [
              { id: "i-1", name: "Shirt", quantity: 1, packed: true, essential: true },
              { id: "i-2", name: "Pants", quantity: 1, packed: false, essential: true },
            ],
          },
          {
            id: "cat-2",
            name: "Electronics",
            color: "#fff",
            items: [
              { id: "i-3", name: "Phone", quantity: 1, packed: true, essential: true },
            ],
          },
        ],
      } as Trip;

      expect(getPackingProgress(trip)).toEqual({ packed: 2, total: 3 });
    });

    it("handles trips with no packing items", () => {
      const emptyTrip = { packingCategories: [] } as unknown as Trip;
      expect(getPackingProgress(emptyTrip)).toEqual({ packed: 0, total: 0 });
    });
  });

  describe("Date formatting functions", () => {
    it("formatDate formats ISO string into full month, day, year", () => {
      const formatted = formatDate("2025-06-15T00:00:00.000Z");
      expect(formatted).toContain("June");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2025");
    });

    it("formatDateShort formats ISO string into short month and day", () => {
      const formatted = formatDateShort("2025-06-15T00:00:00.000Z");
      expect(formatted).toContain("Jun");
      expect(formatted).toContain("15");
    });

    it("formatDayHeader formats ISO string into full weekday, month, day", () => {
      const formatted = formatDayHeader("2025-06-15T00:00:00.000Z");
      expect(formatted).toContain("June");
      expect(formatted).toContain("15");
    });
  });

  describe("generateItinerary", () => {
    it("generates DayPlan array for each date in range inclusive", () => {
      const itinerary = generateItinerary("2025-06-10", "2025-06-12");
      expect(itinerary).toHaveLength(3);
      expect(itinerary[0]).toEqual({ date: "2025-06-10", activities: [] });
      expect(itinerary[1]).toEqual({ date: "2025-06-11", activities: [] });
      expect(itinerary[2]).toEqual({ date: "2025-06-12", activities: [] });
    });
  });

  describe("getActivityIcon", () => {
    it("returns correct icon for known activity types", () => {
      expect(getActivityIcon("food")).toBe("🍽️");
      expect(getActivityIcon("transport")).toBe("🚗");
      expect(getActivityIcon("activity")).toBe("🎭");
      expect(getActivityIcon("hotel")).toBe("🏨");
    });

    it("returns fallback icon for unknown activity type", () => {
      expect(getActivityIcon("unknown")).toBe("📌");
      expect(getActivityIcon("")).toBe("📌");
    });
  });

  describe("getPackingTemplate", () => {
    it("returns categories for known template key with new IDs", () => {
      const template = getPackingTemplate("beach");
      expect(template.length).toBeGreaterThan(0);
      expect(template[0].name).toBe("Beachwear");
      expect(template[0].id).not.toBe("");
      expect(template[0].items[0].id).not.toBe("");
    });

    it("falls back to default template for unknown key", () => {
      const template = getPackingTemplate("nonexistent_key");
      expect(template.length).toBeGreaterThan(0);
      const clothingCategory = template.find((c) => c.name === "Clothing");
      expect(clothingCategory).toBeDefined();
    });
  });

  describe("PRESET_CATEGORY_COLORS", () => {
    it("exports preset color array", () => {
      expect(Array.isArray(PRESET_CATEGORY_COLORS)).toBe(true);
      expect(PRESET_CATEGORY_COLORS.length).toBeGreaterThan(0);
      expect(PRESET_CATEGORY_COLORS).toContain("#3b82f6");
    });
  });
});
