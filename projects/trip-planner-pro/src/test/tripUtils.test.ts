import { describe, it, expect } from "vitest";
import { getActivityIcon } from "../lib/tripUtils";

describe("getActivityIcon", () => {
  it("returns correct emoji for valid activity types", () => {
    expect(getActivityIcon("food")).toBe("🍽️");
    expect(getActivityIcon("transport")).toBe("🚗");
    expect(getActivityIcon("activity")).toBe("🎭");
    expect(getActivityIcon("hotel")).toBe("🏨");
  });

  it("returns default pin emoji for unknown or unsupported activity types", () => {
    expect(getActivityIcon("shopping")).toBe("📌");
    expect(getActivityIcon("unknown")).toBe("📌");
    expect(getActivityIcon("")).toBe("📌");
  });

  it("returns default pin emoji for case-mismatched or whitespace inputs", () => {
    expect(getActivityIcon("FOOD")).toBe("📌");
    expect(getActivityIcon("food ")).toBe("📌");
  });
});
