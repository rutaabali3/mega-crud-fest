import { useState, useCallback } from "react";

const API_KEY = "386283928cce3fb4beebf918d57a5206";
const CACHE_KEY = "tripcraft_weather_cache";
const CACHE_DURATION = 30 * 60 * 1000;

interface WeatherData {
  name: string;
  sys: { country: string };
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
  visibility: number;
  weather: { id: number; main: string; description: string }[];
}

interface CacheEntry {
  city: string;
  data: WeatherData;
  timestamp: number;
}

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);

    // Check cache
    try {
      const cached: CacheEntry[] = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
      const entry = cached.find((e) => e.city.toLowerCase() === city.toLowerCase());
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        setData(entry.data);
        setLoading(false);
        return;
      }
    } catch { /* ignore */ }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found — try a different spelling");
      const json = await res.json();
      setData(json);

      // Update cache
      try {
        const cached: CacheEntry[] = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
        const filtered = cached.filter((e) => e.city.toLowerCase() !== city.toLowerCase());
        filtered.push({ city, data: json, timestamp: Date.now() });
        localStorage.setItem(CACHE_KEY, JSON.stringify(filtered.slice(-10)));
      } catch { /* ignore */ }
    } catch (e: any) {
      setError(e.message || "Failed to fetch weather");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchWeather };
}

export function getWeatherEmoji(id: number): string {
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return "☀️";
  return "☁️";
}

export function getWeatherTip(main: string): string {
  switch (main) {
    case "Rain":
    case "Drizzle":
      return "Pack a waterproof jacket! ☔";
    case "Snow":
      return "Bring warm layers and boots! 🧣";
    case "Clear":
      return "Perfect weather — don't forget sunscreen! 🧴";
    case "Clouds":
      return "Light jacket recommended 🧥";
    case "Thunderstorm":
      return "Stay safe indoors if possible! ⛈️";
    default:
      return "Check conditions before heading out! 🌍";
  }
}
