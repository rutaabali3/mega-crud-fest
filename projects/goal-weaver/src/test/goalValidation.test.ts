import { describe, it, expect } from "vitest";
import { goalArraySchema, goalSchema, progressLogSchema } from "@/types/goal";

describe("Goal Schema Validation", () => {
  const validGoal = {
    id: "g1",
    title: "Read 12 books",
    unit: "books",
    target: 12,
    deadline: "2025-12-31",
    createdAt: "2025-01-01T00:00:00.000Z",
    isArchived: false,
    progressLogs: [
      {
        id: "p1",
        date: "2025-01-15",
        amount: 1,
        note: "Finished book 1",
      },
    ],
  };

  it("validates valid goal structure successfully", () => {
    const result = goalArraySchema.safeParse([validGoal]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("g1");
    }
  });

  it("validates empty goal array successfully", () => {
    const result = goalArraySchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it("rejects non-array payloads", () => {
    const result = goalArraySchema.safeParse(validGoal);
    expect(result.success).toBe(false);
  });

  it("rejects goal missing required fields", () => {
    const invalidGoal = {
      id: "g1",
      title: "Read 12 books",
      // missing unit, target, etc.
    };
    const result = goalArraySchema.safeParse([invalidGoal]);
    expect(result.success).toBe(false);
  });

  it("rejects goal with invalid types for fields", () => {
    const invalidGoal = {
      ...validGoal,
      target: "twelve", // should be number
    };
    const result = goalArraySchema.safeParse([invalidGoal]);
    expect(result.success).toBe(false);
  });

  it("rejects invalid progress logs within goal", () => {
    const invalidGoal = {
      ...validGoal,
      progressLogs: [
        {
          id: "p1",
          date: "2025-01-15",
          amount: "invalid-amount", // should be number
        },
      ],
    };
    const result = goalArraySchema.safeParse([invalidGoal]);
    expect(result.success).toBe(false);
  });
});
