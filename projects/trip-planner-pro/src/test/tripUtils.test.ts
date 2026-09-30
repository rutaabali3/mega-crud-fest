import { describe, it, expect } from "vitest";
import {
  generateItinerary,
  formatDateShort,
  formatDayHeader,
  getActivityIcon,
  generateId,
  getDestinationEmoji,
} from "../lib/tripUtils";

describe("generateItinerary", () => {
  it("generates a single day plan when start and end date are the same", () => {
    const result = generateItinerary("2025-06-01", "2025-06-01");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: "2025-06-01",
      activities: [],
    });
  });

  it("generates sequential days for a multi-day trip within the same month", () => {
    const result = generateItinerary("2025-06-01", "2025-06-03");
    expect(result).toHaveLength(3);
    expect(result.map((d) => d.date)).toEqual([
      "2025-06-01",
      "2025-06-02",
      "2025-06-03",
    ]);
    result.forEach((day) => {
      expect(day.activities).toEqual([]);
    });
  });

  it("handles month and year boundaries correctly", () => {
    const resultMonth = generateItinerary("2025-01-31", "2025-02-02");
    expect(resultMonth).toHaveLength(3);
    expect(resultMonth.map((d) => d.date)).toEqual([
      "2025-01-31",
      "2025-02-01",
      "2025-02-02",
    ]);

    const resultYear = generateItinerary("2024-12-31", "2025-01-02");
    expect(resultYear).toHaveLength(3);
    expect(resultYear.map((d) => d.date)).toEqual([
      "2024-12-31",
      "2025-01-01",
      "2025-01-02",
    ]);
  });

  it("returns an empty array if endDate is before startDate", () => {
    const result = generateItinerary("2025-06-05", "2025-06-01");
    expect(result).toEqual([]);
  });
});

describe("formatDateShort", () => {
  it("formats ISO date string into short month and day", () => {
    const formatted = formatDateShort("2025-06-15T00:00:00.000Z");
    expect(formatted).toMatch(/Jun 15/);
  });
});

describe("formatDayHeader", () => {
  it("formats ISO date string into weekday, long month, and day", () => {
    const formatted = formatDayHeader("2025-06-15T00:00:00.000Z");
    expect(formatted).toMatch(/June 15/);
  });
});

describe("getActivityIcon", () => {
  it("returns appropriate icon for known activity types", () => {
    expect(getActivityIcon("food")).toBe("🍽️");
    expect(getActivityIcon("transport")).toBe("🚗");
    expect(getActivityIcon("activity")).toBe("🎭");
    expect(getActivityIcon("hotel")).toBe("🏨");
  });

  it("returns default pin icon for unknown activity types", () => {
    expect(getActivityIcon("unknown")).toBe("📌");
    expect(getActivityIcon("")).toBe("📌");
  });
});

describe("generateId", () => {
  it("generates a string ID", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const id1 = generateId();
    expect(id1).not.toBe(generateId());
  });
});

describe("getDestinationEmoji", () => {
  it("returns matching emoji for specific destinations", () => {
    expect(getDestinationEmoji("Hawaii Beach")).toBe("🏖️");
    expect(getDestinationEmoji("Paris")).toBe("🗼");
    expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
    expect(getDestinationEmoji("London")).toBe("🇬🇧");
    expect(getDestinationEmoji("New York")).toBe("🗽");
    expect(getDestinationEmoji("Rome")).toBe("🏛️");
    expect(getDestinationEmoji("Swiss Alps Mountain")).toBe("🏔️");
    expect(getDestinationEmoji("Sydney, Australia")).toBe("🦘");
    expect(getDestinationEmoji("India")).toBe("🇮🇳");
    expect(getDestinationEmoji("Beijing, China")).toBe("🇨🇳");
    expect(getDestinationEmoji("Cairo, Egypt")).toBe("🏺");
    expect(getDestinationEmoji("Safari in Kenya")).toBe("🦁");
    expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
    expect(getDestinationEmoji("Camping in woods")).toBe("⛺");
  });

  it("returns default airplane emoji for unmatched destinations", () => {
    expect(getDestinationEmoji("Unknown City")).toBe("✈️");
  });
});
