import { useState, useCallback, useEffect } from "react";

const PAIRS_KEY = "tripcraft_currency_pairs";

interface CurrencyCode {
  code: string;
  name: string;
}

export function useCurrency() {
  const [codes, setCodes] = useState<CurrencyCode[]>([]);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentPairs, setRecentPairs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(PAIRS_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => {
        if (d.rates) {
          setCodes(Object.keys(d.rates).sort().map((code) => ({ code, name: code })));
        }
      })
      .catch(() => {});
  }, []);

  const convert = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const json = await res.json();
      if (json.result === "error") throw new Error("Failed to fetch rates");
      setRates(json.rates);

      const pair = `${from}→${to}`;
      setRecentPairs((prev) => {
        const next = [pair, ...prev.filter((p) => p !== pair)].slice(0, 3);
        localStorage.setItem(PAIRS_KEY, JSON.stringify(next));
        return next;
      });
    } catch (e: any) {
      setError(e.message);
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { codes, rates, loading, error, convert, recentPairs };
}
