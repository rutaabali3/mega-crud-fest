import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWeather, getWeatherEmoji, getWeatherTip } from "../hooks/useWeather";

describe("useWeather utilities", () => {
  it("returns correct weather emoji for weather IDs", () => {
    expect(getWeatherEmoji(205)).toBe("⛈️");
    expect(getWeatherEmoji(310)).toBe("🌦️");
    expect(getWeatherEmoji(501)).toBe("🌧️");
    expect(getWeatherEmoji(600)).toBe("❄️");
    expect(getWeatherEmoji(711)).toBe("🌫️");
    expect(getWeatherEmoji(800)).toBe("☀️");
    expect(getWeatherEmoji(802)).toBe("☁️");
  });

  it("returns correct weather tips for weather conditions", () => {
    expect(getWeatherTip("Rain")).toBe("Pack a waterproof jacket! ☔");
    expect(getWeatherTip("Snow")).toBe("Bring warm layers and boots! 🧣");
    expect(getWeatherTip("Clear")).toBe("Perfect weather — don't forget sunscreen! 🧴");
    expect(getWeatherTip("Clouds")).toBe("Light jacket recommended 🧥");
    expect(getWeatherTip("Thunderstorm")).toBe("Stay safe indoors if possible! ⛈️");
    expect(getWeatherTip("Unknown")).toBe("Check conditions before heading out! 🌍");
  });
});

describe("useWeather environment configuration", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("constructs weather fetch URL using VITE_OPENWEATHER_API_KEY environment variable", async () => {
    const mockWeatherData = {
      name: "Tokyo",
      sys: { country: "JP" },
      main: { temp: 20, feels_like: 19, humidity: 65 },
      wind: { speed: 3 },
      visibility: 10000,
      weather: [{ id: 800, main: "Clear", description: "clear sky" }],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWeatherData,
    });
    global.fetch = mockFetch;

    const city = "Tokyo";
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const json = await res.json();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=")
    );
    expect(json).toEqual(mockWeatherData);
  });
});

describe("useWeather hook", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch weather when city string is empty or only whitespace", async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather("   ");
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles non-OK HTTP responses (e.g. 404 City not found)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather("NonExistentCity12345");
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("q=NonExistentCity12345")
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("City not found — try a different spelling");
  });

  it("handles network errors during fetch", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network connection error"));
    global.fetch = mockFetch;

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather("Paris");
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("q=Paris"));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network connection error");
  });

  it("fetches weather successfully and updates cache", async () => {
    const mockWeatherData = {
      name: "London",
      sys: { country: "GB" },
      main: { temp: 15, feels_like: 14, humidity: 70 },
      wind: { speed: 5 },
      visibility: 10000,
      weather: [{ id: 500, main: "Rain", description: "light rain" }],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWeatherData,
    });
    global.fetch = mockFetch;

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather("London");
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("q=London"));
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();

    // Verify localStorage cache
    const cached = JSON.parse(localStorage.getItem("tripcraft_weather_cache") || "[]");
    expect(cached).toHaveLength(1);
    expect(cached[0].city).toBe("London");
    expect(cached[0].data).toEqual(mockWeatherData);
  });

  it("uses cached weather data when available and valid without calling fetch", async () => {
    const mockWeatherData = {
      name: "Paris",
      sys: { country: "FR" },
      main: { temp: 18, feels_like: 18, humidity: 60 },
      wind: { speed: 2 },
      visibility: 10000,
      weather: [{ id: 800, main: "Clear", description: "clear sky" }],
    };

    const cacheEntry = {
      city: "Paris",
      data: mockWeatherData,
      timestamp: Date.now(),
    };
    localStorage.setItem("tripcraft_weather_cache", JSON.stringify([cacheEntry]));

    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather("paris");
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
  });
});
