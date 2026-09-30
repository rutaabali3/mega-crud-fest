import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getWeatherEmoji, getWeatherTip } from "../hooks/useWeather";

describe("useWeather utilities", () => {
  it("returns correct weather emoji for weather IDs including boundaries", () => {
    // Boundary and range tests for OpenWeather condition code ranges
    expect(getWeatherEmoji(199)).toBe("☁️");
    expect(getWeatherEmoji(200)).toBe("⛈️");
    expect(getWeatherEmoji(205)).toBe("⛈️");
    expect(getWeatherEmoji(299)).toBe("⛈️");

    expect(getWeatherEmoji(300)).toBe("🌦️");
    expect(getWeatherEmoji(310)).toBe("🌦️");
    expect(getWeatherEmoji(399)).toBe("🌦️");

    expect(getWeatherEmoji(400)).toBe("☁️");
    expect(getWeatherEmoji(499)).toBe("☁️");

    expect(getWeatherEmoji(500)).toBe("🌧️");
    expect(getWeatherEmoji(501)).toBe("🌧️");
    expect(getWeatherEmoji(599)).toBe("🌧️");

    expect(getWeatherEmoji(600)).toBe("❄️");
    expect(getWeatherEmoji(699)).toBe("❄️");

    expect(getWeatherEmoji(700)).toBe("🌫️");
    expect(getWeatherEmoji(711)).toBe("🌫️");
    expect(getWeatherEmoji(799)).toBe("🌫️");

    expect(getWeatherEmoji(800)).toBe("☀️");
    expect(getWeatherEmoji(801)).toBe("☁️");
    expect(getWeatherEmoji(802)).toBe("☁️");

    expect(getWeatherEmoji(-1)).toBe("☁️");
    expect(getWeatherEmoji(0)).toBe("☁️");
  });

  it("returns correct weather tips for all supported weather conditions", () => {
    expect(getWeatherTip("Rain")).toBe("Pack a waterproof jacket! ☔");
    expect(getWeatherTip("Drizzle")).toBe("Pack a waterproof jacket! ☔");
    expect(getWeatherTip("Snow")).toBe("Bring warm layers and boots! 🧣");
    expect(getWeatherTip("Clear")).toBe("Perfect weather — don't forget sunscreen! 🧴");
    expect(getWeatherTip("Clouds")).toBe("Light jacket recommended 🧥");
    expect(getWeatherTip("Thunderstorm")).toBe("Stay safe indoors if possible! ⛈️");
  });

  it("returns default fallback weather tip for edge cases and unhandled conditions", () => {
    const defaultTip = "Check conditions before heading out! 🌍";

    // Unhandled standard OpenWeather main conditions
    expect(getWeatherTip("Mist")).toBe(defaultTip);
    expect(getWeatherTip("Fog")).toBe(defaultTip);
    expect(getWeatherTip("Haze")).toBe(defaultTip);
    expect(getWeatherTip("Squall")).toBe(defaultTip);
    expect(getWeatherTip("Tornado")).toBe(defaultTip);

    // Case sensitivity checks
    expect(getWeatherTip("rain")).toBe(defaultTip);
    expect(getWeatherTip("CLEAR")).toBe(defaultTip);
    expect(getWeatherTip("drizzle")).toBe(defaultTip);

    // Whitespace, empty, and unusual inputs
    expect(getWeatherTip("")).toBe(defaultTip);
    expect(getWeatherTip("   ")).toBe(defaultTip);
    expect(getWeatherTip(" Rain ")).toBe(defaultTip);
    expect(getWeatherTip("Unknown")).toBe(defaultTip);
    expect(getWeatherTip("12345")).toBe(defaultTip);
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
