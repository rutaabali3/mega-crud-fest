import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLocalStorage } from "../hooks/useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default value when localStorage has no value for key", () => {
    const { result } = renderHook(() => useLocalStorage("testKey", "defaultValue"));
    const [storedValue] = result.current;

    expect(storedValue).toBe("defaultValue");
  });

  it("returns stored value when valid JSON exists in localStorage", () => {
    localStorage.setItem("testKey", JSON.stringify("storedValue"));

    const { result } = renderHook(() => useLocalStorage("testKey", "defaultValue"));
    const [storedValue] = result.current;

    expect(storedValue).toBe("storedValue");
  });

  it("returns default value when stored JSON in localStorage is malformed", () => {
    localStorage.setItem("testKey", "{ invalid json ");

    const { result } = renderHook(() => useLocalStorage("testKey", "defaultValue"));
    const [storedValue] = result.current;

    expect(storedValue).toBe("defaultValue");
  });

  it("returns default value when localStorage.getItem throws an error", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access is denied");
    });

    const { result } = renderHook(() => useLocalStorage("testKey", "defaultValue"));
    const [storedValue] = result.current;

    expect(storedValue).toBe("defaultValue");
  });

  it("updates state and saves to localStorage when setValue is called with a direct value", () => {
    const { result } = renderHook(() => useLocalStorage("testKey", { count: 0 }));

    act(() => {
      const [, setValue] = result.current;
      setValue({ count: 1 });
    });

    expect(result.current[0]).toEqual({ count: 1 });
    expect(localStorage.getItem("testKey")).toBe(JSON.stringify({ count: 1 }));
  });

  it("updates state and saves to localStorage when setValue is called with a functional updater", () => {
    const { result } = renderHook(() => useLocalStorage<number>("testKey", 10));

    act(() => {
      const [, setValue] = result.current;
      setValue((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.getItem("testKey")).toBe(JSON.stringify(15));
  });

  it("handles localStorage.setItem error gracefully without throwing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    expect(() => {
      act(() => {
        const [, setValue] = result.current;
        setValue("updated");
      });
    }).not.toThrow();

    // State should still be updated in memory
    expect(result.current[0]).toBe("updated");
  });
});
