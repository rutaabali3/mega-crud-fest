import { describe, it, expect, vi } from "vitest";
import { generateId } from "./storage";

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
