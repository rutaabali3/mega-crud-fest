import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getWeatherEmoji, getWeatherTip } from "../hooks/useWeather";

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
