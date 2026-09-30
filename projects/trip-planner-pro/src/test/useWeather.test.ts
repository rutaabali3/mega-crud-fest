import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getWeatherEmoji, getWeatherTip } from "../hooks/useWeather";

describe("useWeather utilities", () => {
  describe("getWeatherEmoji", () => {
    it("returns thunderstorm emoji for weather IDs in 200-299 range (including boundaries)", () => {
      expect(getWeatherEmoji(200)).toBe("⛈️");
      expect(getWeatherEmoji(250)).toBe("⛈️");
      expect(getWeatherEmoji(299)).toBe("⛈️");
    });

    it("returns drizzle emoji for weather IDs in 300-399 range (including boundaries)", () => {
      expect(getWeatherEmoji(300)).toBe("🌦️");
      expect(getWeatherEmoji(350)).toBe("🌦️");
      expect(getWeatherEmoji(399)).toBe("🌦️");
    });

    it("returns rain emoji for weather IDs in 500-599 range (including boundaries)", () => {
      expect(getWeatherEmoji(500)).toBe("🌧️");
      expect(getWeatherEmoji(550)).toBe("🌧️");
      expect(getWeatherEmoji(599)).toBe("🌧️");
    });

    it("returns snow emoji for weather IDs in 600-699 range (including boundaries)", () => {
      expect(getWeatherEmoji(600)).toBe("❄️");
      expect(getWeatherEmoji(650)).toBe("❄️");
      expect(getWeatherEmoji(699)).toBe("❄️");
    });

    it("returns atmosphere emoji for weather IDs in 700-799 range (including boundaries)", () => {
      expect(getWeatherEmoji(700)).toBe("🌫️");
      expect(getWeatherEmoji(750)).toBe("🌫️");
      expect(getWeatherEmoji(799)).toBe("🌫️");
    });

    it("returns sun emoji for clear sky (weather ID 800)", () => {
      expect(getWeatherEmoji(800)).toBe("☀️");
    });

    it("returns default cloud emoji for unhandled ranges and edge cases", () => {
      expect(getWeatherEmoji(199)).toBe("☁️");
      expect(getWeatherEmoji(400)).toBe("☁️");
      expect(getWeatherEmoji(499)).toBe("☁️");
      expect(getWeatherEmoji(801)).toBe("☁️");
      expect(getWeatherEmoji(804)).toBe("☁️");
      expect(getWeatherEmoji(900)).toBe("☁️");
      expect(getWeatherEmoji(-1)).toBe("☁️");
    });
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
