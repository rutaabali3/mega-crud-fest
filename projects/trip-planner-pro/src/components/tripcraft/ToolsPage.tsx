import React, { useState } from "react";
import { Trip } from "@/types/trip";
import { useWeather, getWeatherEmoji, getWeatherTip } from "@/hooks/useWeather";
import { useCurrency } from "@/hooks/useCurrency";
import { Search, ArrowLeftRight, Loader2 } from "lucide-react";

interface Props {
  trips: Trip[];
}

export default function ToolsPage({ trips }: Props) {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold text-primary">Tools</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <WeatherWidget trips={trips} />
        <CurrencyWidget />
      </div>
    </div>
  );
}

function WeatherWidget({ trips }: { trips: Trip[] }) {
  const [city, setCity] = useState("");
  const { data, loading, error, fetchWeather } = useWeather();

  const quickCities = trips
    .map((t) => t.destination.split(",")[0].trim())
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4);

  const handleSearch = () => { if (city.trim()) fetchWeather(city); };

  const bgGradient = data
    ? data.weather[0].main === "Clear"
      ? "from-amber-400/20 to-sky/20"
      : data.weather[0].main === "Clouds"
      ? "from-slate-300/20 to-slate-400/20"
      : data.weather[0].main === "Rain" || data.weather[0].main === "Drizzle"
      ? "from-slate-500/20 to-blue-400/20"
      : data.weather[0].main === "Snow"
      ? "from-blue-100/30 to-white/20"
      : "from-secondary/10 to-sky/10"
    : "from-secondary/10 to-sky/10";

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${bgGradient} p-6`}>
      <h3 className="mb-4 text-lg font-semibold text-primary">🌤️ Weather Checker</h3>

      <div className="flex gap-2">
        <input
          placeholder="Enter a city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 rounded-xl border bg-background/80 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary"
        />
        <button onClick={handleSearch} disabled={loading}
          className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {quickCities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {quickCities.map((c) => (
            <button key={c} onClick={() => { setCity(c); fetchWeather(c); }}
              className="rounded-full bg-background/60 px-3 py-1 text-xs hover:bg-background">{c}</button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 space-y-3">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {data && !loading && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{getWeatherEmoji(data.weather[0].id)}</span>
            <div>
              <p className="text-3xl font-bold text-primary">{Math.round(data.main.temp)}°C</p>
              <p className="text-sm text-muted-foreground">{data.name}, {data.sys.country}</p>
            </div>
          </div>
          <p className="text-sm capitalize text-muted-foreground">{data.weather[0].description}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-background/60 p-2">
              <p className="text-xs text-muted-foreground">Feels like</p>
              <p className="font-semibold text-sm">{Math.round(data.main.feels_like)}°C</p>
            </div>
            <div className="rounded-xl bg-background/60 p-2">
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-semibold text-sm">{data.main.humidity}%</p>
            </div>
            <div className="rounded-xl bg-background/60 p-2">
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-semibold text-sm">{(data.wind.speed * 3.6).toFixed(1)} km/h</p>
            </div>
          </div>
          <div className="rounded-xl bg-background/60 px-4 py-3 text-sm">
            💡 {getWeatherTip(data.weather[0].main)}
          </div>
        </div>
      )}
    </div>
  );
}

function CurrencyWidget() {
  const { codes, rates, loading, error, convert, recentPairs } = useCurrency();
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [amount, setAmount] = useState("1");

  const swap = () => { setFrom(to); setTo(from); };

  const result = rates && rates[to] ? (parseFloat(amount) || 0) * rates[to] : null;

  const handleConvert = () => convert(from, to);

  const applyPair = (pair: string) => {
    const [f, t] = pair.split("→");
    setFrom(f);
    setTo(t);
    convert(f, t);
  };

  const multipliers = [2, 5, 10, 50, 100];

  return (
    <div className="rounded-2xl border bg-card/80 p-6 backdrop-blur">
      <h3 className="mb-4 text-lg font-semibold text-primary">💱 Currency Converter</h3>

      {/* From */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary" />
          <select value={from} onChange={(e) => setFrom(e.target.value)}
            className="w-24 rounded-xl border bg-background px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary">
            {codes.length > 0
              ? codes.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)
              : ["USD", "EUR", "GBP", "JPY"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Swap */}
        <div className="flex justify-center">
          <button onClick={swap} className="rounded-full border p-2 hover:bg-muted transition-colors">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* To */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl border bg-muted/50 px-4 py-2.5 text-sm font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : result !== null ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "—"}
          </div>
          <select value={to} onChange={(e) => setTo(e.target.value)}
            className="w-24 rounded-xl border bg-background px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary">
            {codes.length > 0
              ? codes.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)
              : ["USD", "EUR", "GBP", "JPY"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {result !== null && (
        <p className="mt-2 text-xs text-muted-foreground">
          1 {from} = {(rates![to]).toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}
        </p>
      )}

      <button onClick={handleConvert} disabled={loading}
        className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Converting..." : "Convert"}
      </button>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {/* Quick multipliers */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {multipliers.map((m) => (
          <button key={m} onClick={() => setAmount((parseFloat(amount) * m).toString())}
            className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-muted/80">×{m}</button>
        ))}
      </div>

      {/* Recent pairs */}
      {recentPairs.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs text-muted-foreground">Recent</p>
          <div className="flex flex-wrap gap-1.5">
            {recentPairs.map((p) => (
              <button key={p} onClick={() => applyPair(p)}
                className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary hover:bg-secondary/20">{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
