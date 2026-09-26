import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateId, importData, getPieces, getSessions, getGoals, getSettings } from "./storage";

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("importData schema validation", () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  it("successfully imports valid payload into local storage", () => {
    const validData = {
      pieces: [
        {
          id: "p1",
          title: "Moonlight Sonata",
          composer: "Beethoven",
          instrument: "Piano",
          difficulty: "Advanced",
          targetBPM: 120,
          currentBPM: 100,
          status: "active",
          dateAdded: "2023-01-01",
          dateMastered: null,
          color: "#ffffff",
          tags: ["classical"],
        },
      ],
      sessions: [
        {
          id: "s1",
          pieceId: "p1",
          date: "2023-01-02",
          durationMinutes: 30,
          bpmReached: 100,
          mood: "4",
          notes: "Good practice",
          instrument: "Piano",
        },
      ],
      goals: [
        {
          id: "g1",
          weekStartDate: "2023-01-01",
          targetMinutes: 120,
          instrument: "Piano",
          label: "Weekly goal",
        },
      ],
      settings: {
        defaultInstrument: "Piano",
        metronomeBPM: 120,
        metronomeBeatsPerMeasure: 4,
        weeklyGoalMinutes: 120,
        theme: "dark",
      },
    };

    expect(() => importData(validData)).not.toThrow();
    expect(getPieces()).toHaveLength(1);
    expect(getPieces()[0].title).toBe("Moonlight Sonata");
    expect(getSessions()).toHaveLength(1);
    expect(getGoals()).toHaveLength(1);
    expect(getSettings().defaultInstrument).toBe("Piano");
  });

  it("throws error and rejects import on invalid piece difficulty or fields", () => {
    const invalidData = {
      pieces: [
        {
          id: "p1",
          title: "Invalid Piece",
          composer: "Unknown",
          instrument: "Piano",
          difficulty: "SuperHard", // Invalid enum value
          targetBPM: 120,
          currentBPM: 100,
          status: "active",
          dateAdded: "2023-01-01",
          dateMastered: null,
          color: "#ffffff",
          tags: [],
        },
      ],
    };

    expect(() => importData(invalidData)).toThrow();
    expect(getPieces()).toHaveLength(0);
  });

  it("throws error on primitive or malformed payloads", () => {
    expect(() => importData("not json object")).toThrow();
    expect(() => importData(12345)).toThrow();
    expect(() => importData(null)).toThrow();
    expect(getPieces()).toHaveLength(0);
  });
});

describe("generateId", () => {
  it("should return a valid UUID string format", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidRegex);
  });

  it("should delegate to crypto.randomUUID", () => {
    const mockUuid = "123e4567-e89b-12d3-a456-426614174000";
    const spy = vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(mockUuid);

    const result = generateId();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockUuid);

    spy.mockRestore();
  });

  it("should generate unique IDs across multiple calls", () => {
    const ids = new Set();
    const count = 100;
    for (let i = 0; i < count; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(count);
  });
});
