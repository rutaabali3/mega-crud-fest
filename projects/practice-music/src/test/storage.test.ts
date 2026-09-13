import { describe, it, expect, beforeEach } from "vitest";
import { getJSON } from "../utils/storage";

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

describe("getJSON", () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  it("returns fallback value when key does not exist in localStorage", () => {
    const fallback = { count: 0 };
    const result = getJSON("non_existent_key", fallback);
    expect(result).toEqual(fallback);
  });

  it("parses and returns valid JSON from localStorage", () => {
    const data = { name: "Piano", active: true };
    localStorage.setItem("test_key", JSON.stringify(data));

    const result = getJSON("test_key", { name: "", active: false });
    expect(result).toEqual(data);
  });

  it("catches JSON parsing error and returns fallback value when invalid JSON is stored", () => {
    localStorage.setItem("corrupted_key", "{ invalid json string ");
    const fallback = { status: "default" };

    const result = getJSON("corrupted_key", fallback);
    expect(result).toEqual(fallback);
  });
});
