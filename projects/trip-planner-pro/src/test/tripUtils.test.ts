import { describe, it, expect, vi, afterEach } from "vitest";
import { generateId, getDestinationEmoji } from "../lib/tripUtils";

describe("generateId", () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalCrypto) {
      Object.defineProperty(globalThis, "crypto", {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    }
  });

  it("returns a string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates distinct unique IDs across multiple calls", () => {
    const count = 100;
    const ids = new Set<string>();
    for (let i = 0; i < count; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(count);
  });

  it("uses crypto.randomUUID when available", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const mockRandomUUID = vi.fn().mockReturnValue(mockUUID);

    Object.defineProperty(globalThis, "crypto", {
      value: { randomUUID: mockRandomUUID },
      writable: true,
      configurable: true,
    });

    const id = generateId();
    expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    expect(id).toBe(mockUUID);
  });

  it("falls back to Math.random and Date.now when crypto.randomUUID is not available", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const id1 = generateId();
    const id2 = generateId();

    expect(typeof id1).toBe("string");
    expect(typeof id2).toBe("string");
    expect(id1.length).toBeGreaterThan(0);
    expect(id2.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });
});

describe("getDestinationEmoji", () => {
  it("returns appropriate emoji for known destination keywords (case insensitive)", () => {
    expect(getDestinationEmoji("Sunny Beach")).toBe("🏖️");
    expect(getDestinationEmoji("BALI")).toBe("🏖️");
    expect(getDestinationEmoji("Paris, France")).toBe("🗼");
    expect(getDestinationEmoji("Tokyo, Japan")).toBe("🗾");
    expect(getDestinationEmoji("London, UK")).toBe("🇬🇧");
    expect(getDestinationEmoji("New York")).toBe("🗽");
    expect(getDestinationEmoji("Rome")).toBe("🏛️");
    expect(getDestinationEmoji("Alps Mountain")).toBe("🏔️");
    expect(getDestinationEmoji("Sydney, Australia")).toBe("🦘");
    expect(getDestinationEmoji("India")).toBe("🇮🇳");
    expect(getDestinationEmoji("Beijing, China")).toBe("🇨🇳");
    expect(getDestinationEmoji("Cairo, Egypt")).toBe("🏺");
    expect(getDestinationEmoji("Kenya Safari")).toBe("🦁");
    expect(getDestinationEmoji("Caribbean Cruise")).toBe("🚢");
    expect(getDestinationEmoji("Camping in woods")).toBe("⛺");
  });

  it("returns default airplane emoji for unknown destinations", () => {
    expect(getDestinationEmoji("Unknown City")).toBe("✈️");
    expect(getDestinationEmoji("Space Station")).toBe("✈️");
  });
});
