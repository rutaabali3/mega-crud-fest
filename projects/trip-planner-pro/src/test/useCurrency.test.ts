import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCurrency } from "../hooks/useCurrency";

const PAIRS_KEY = "tripcraft_currency_pairs";

describe("useCurrency hook", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it("fetches and sets sorted currency codes on mount", async () => {
    const mockRatesData = {
      rates: {
        EUR: 0.85,
        USD: 1,
        GBP: 0.75,
        CAD: 1.25,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => mockRatesData,
    } as Response);

    const { result } = renderHook(() => useCurrency());

    await waitFor(() => {
      expect(result.current.codes.length).toBe(4);
    });

    expect(result.current.codes).toEqual([
      { code: "CAD", name: "CAD" },
      { code: "EUR", name: "EUR" },
      { code: "GBP", name: "GBP" },
      { code: "USD", name: "USD" },
    ]);
    expect(global.fetch).toHaveBeenCalledWith("https://open.er-api.com/v6/latest/USD");
  });

  it("handles mount fetch failure gracefully without setting codes", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCurrency());

    // Give microtasks a chance to run
    await new Promise((r) => setTimeout(r, 50));

    expect(result.current.codes).toEqual([]);
  });

  it("initializes recentPairs from localStorage", () => {
    const storedPairs = ["USD→EUR", "EUR→GBP"];
    localStorage.setItem(PAIRS_KEY, JSON.stringify(storedPairs));

    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // pending

    const { result } = renderHook(() => useCurrency());

    expect(result.current.recentPairs).toEqual(storedPairs);
  });

  it("handles invalid JSON in localStorage gracefully", () => {
    localStorage.setItem(PAIRS_KEY, "{invalid json}");

    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCurrency());

    expect(result.current.recentPairs).toEqual([]);
  });

  it("converts currency successfully, updates rates and recentPairs", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/USD")) {
        return Promise.resolve({
          json: async () => ({ rates: { USD: 1, EUR: 0.9 } }),
        });
      }
      if (url.includes("/EUR")) {
        return Promise.resolve({
          json: async () => ({
            result: "success",
            rates: { EUR: 1, USD: 1.11, GBP: 0.86 },
          }),
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });

    const { result } = renderHook(() => useCurrency());

    await waitFor(() => {
      expect(result.current.codes.length).toBe(2);
    });

    await act(async () => {
      await result.current.convert("EUR", "USD");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.rates).toEqual({ EUR: 1, USD: 1.11, GBP: 0.86 });
    expect(result.current.recentPairs).toEqual(["EUR→USD"]);
    expect(JSON.parse(localStorage.getItem(PAIRS_KEY) || "[]")).toEqual(["EUR→USD"]);
  });

  it("limits recentPairs to 3 items and deduplicates recent pairs", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ result: "success", rates: { USD: 1 } }),
    } as Response);

    const { result } = renderHook(() => useCurrency());

    await act(async () => {
      await result.current.convert("USD", "EUR");
    });
    await act(async () => {
      await result.current.convert("EUR", "GBP");
    });
    await act(async () => {
      await result.current.convert("GBP", "JPY");
    });

    expect(result.current.recentPairs).toEqual(["GBP→JPY", "EUR→GBP", "USD→EUR"]);

    // Convert an existing pair again ("EUR→GBP")
    await act(async () => {
      await result.current.convert("EUR", "GBP");
    });

    // Should move "EUR→GBP" to top without exceeding length 3
    expect(result.current.recentPairs).toEqual(["EUR→GBP", "GBP→JPY", "USD→EUR"]);
  });

  it("handles convert API error response", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/latest/USD")) {
        return Promise.resolve({
          json: async () => ({ rates: { USD: 1 } }),
        });
      }
      return Promise.resolve({
        json: async () => ({ result: "error" }),
      });
    });

    const { result } = renderHook(() => useCurrency());

    await waitFor(() => {
      expect(result.current.codes.length).toBe(1);
    });

    await act(async () => {
      await result.current.convert("INVALID", "USD");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to fetch rates");
    expect(result.current.rates).toBeNull();
  });

  it("handles convert network rejection", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/latest/USD")) {
        return Promise.resolve({
          json: async () => ({ rates: { USD: 1 } }),
        });
      }
      return Promise.reject(new Error("Network request failed"));
    });

    const { result } = renderHook(() => useCurrency());

    await waitFor(() => {
      expect(result.current.codes.length).toBe(1);
    });

    await act(async () => {
      await result.current.convert("EUR", "USD");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network request failed");
    expect(result.current.rates).toBeNull();
  });
});
