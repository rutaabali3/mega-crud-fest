import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDaysUntil, getTripStatus } from "@/lib/tripUtils";
import { Trip } from "@/types/trip";

function createMockTrip(startDate: string, endDate: string): Trip {
  return {
    id: "trip-1",
    destination: "Paris",
    coverEmoji: "🗼",
    startDate,
    endDate,
    accommodation: {
      name: "Hotel Paris",
      address: "123 Rue de Paris",
      confirmationNo: "CONF123",
    },
    budget: {
      total: 1000,
      currency: "USD",
      spent: 0,
    },
    itinerary: [],
    packingCategories: [],
    expenses: [],
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

describe("tripUtils - getTripStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return UPCOMING if now is before start date", () => {
    const trip = createMockTrip("2025-06-05", "2025-06-10");
    expect(getTripStatus(trip)).toBe("UPCOMING");
  });

  it("should return ONGOING if now is on start date", () => {
    const trip = createMockTrip("2025-06-01", "2025-06-05");
    expect(getTripStatus(trip)).toBe("ONGOING");
  });

  it("should return ONGOING if now is during trip dates", () => {
    const trip = createMockTrip("2025-05-30", "2025-06-05");
    expect(getTripStatus(trip)).toBe("ONGOING");
  });

  it("should return ONGOING if now is on end date", () => {
    const trip = createMockTrip("2025-05-28", "2025-06-01");
    expect(getTripStatus(trip)).toBe("ONGOING");
  });

  it("should return COMPLETED if now is after end date", () => {
    const trip = createMockTrip("2025-05-20", "2025-05-31");
    expect(getTripStatus(trip)).toBe("COMPLETED");
  });
});

describe("tripUtils - getDaysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T08:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("when trip status is UPCOMING", () => {
    it("should display singular 'day' when 1 day until departure", () => {
      const trip = createMockTrip("2025-06-02", "2025-06-10");
      expect(getDaysUntil(trip)).toBe("1 day until departure");
    });

    it("should display plural 'days' when multiple days until departure", () => {
      const trip = createMockTrip("2025-06-06", "2025-06-10");
      expect(getDaysUntil(trip)).toBe("5 days until departure");
    });
  });

  describe("when trip status is ONGOING", () => {
    it("should format string correctly on Day 1", () => {
      const trip = createMockTrip("2025-06-01", "2025-06-05");
      expect(getDaysUntil(trip)).toBe("Day 1 of 5");
    });

    it("should format string correctly in the middle of trip", () => {
      const trip = createMockTrip("2025-05-30", "2025-06-03");
      expect(getDaysUntil(trip)).toBe("Day 3 of 5");
    });

    it("should format string correctly on last day of trip", () => {
      const trip = createMockTrip("2025-05-28", "2025-06-01");
      expect(getDaysUntil(trip)).toBe("Day 5 of 5");
    });
  });

  describe("when trip status is COMPLETED", () => {
    it("should return 'Trip completed'", () => {
      const trip = createMockTrip("2025-05-20", "2025-05-31");
      expect(getDaysUntil(trip)).toBe("Trip completed");
    });
  });
});
