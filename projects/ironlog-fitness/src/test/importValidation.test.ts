import { describe, it, expect } from "vitest";
import { ImportPayloadSchema } from "../schemas/importSchema";

describe("ImportPayloadSchema validation", () => {
  it("validates a valid import payload", () => {
    const validData = {
      ironlog_programs: [
        {
          id: "p1",
          name: "Push Pull Legs",
          daysPerWeek: 3,
          createdAt: "2025-01-01T00:00:00.000Z",
          days: [
            {
              dayIndex: 0,
              label: "Push",
              exercises: [
                {
                  id: "e1",
                  name: "Bench Press",
                  sets: 3,
                  reps: "8-10",
                  restSeconds: 90,
                  notes: "",
                },
              ],
            },
          ],
        },
      ],
      ironlog_sessions: [
        {
          id: "s1",
          programId: "p1",
          programName: "Push Pull Legs",
          dayLabel: "Push",
          date: "2025-01-02",
          durationMinutes: 45,
          exercises: [
            {
              exerciseId: "e1",
              name: "Bench Press",
              sets: [
                {
                  setNumber: 1,
                  weight: 80,
                  reps: 10,
                  completed: true,
                },
              ],
            },
          ],
          notes: "Good workout",
        },
      ],
      ironlog_measurements: [
        {
          id: "m1",
          date: "2025-01-01",
          weight: 75,
          unit: "kg",
          bodyFat: 15,
          chest: null,
          waist: null,
          hips: null,
          biceps: null,
          thighs: null,
          notes: "",
        },
      ],
    };

    const result = ImportPayloadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid measurement units", () => {
    const invalidData = {
      ironlog_measurements: [
        {
          id: "m1",
          date: "2025-01-01",
          weight: 75,
          unit: "tons", // Invalid unit
          bodyFat: null,
          chest: null,
          waist: null,
          hips: null,
          biceps: null,
          thighs: null,
          notes: "",
        },
      ],
    };

    const result = ImportPayloadSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects malformed session structures with missing required fields", () => {
    const invalidData = {
      ironlog_sessions: [
        {
          id: "s1",
          // missing programId, programName, etc.
          date: "2025-01-02",
        },
      ],
    };

    const result = ImportPayloadSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("accepts partial payload missing optional keys", () => {
    const partialData = {
      ironlog_programs: [],
    };

    const result = ImportPayloadSchema.safeParse(partialData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ironlog_programs).toEqual([]);
      expect(result.data.ironlog_sessions).toBeUndefined();
    }
  });
});
