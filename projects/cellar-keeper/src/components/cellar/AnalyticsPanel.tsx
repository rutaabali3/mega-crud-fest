import { useMemo } from "react";
import { Bottle, BOTTLE_TYPES, TYPE_ICONS } from "@/types/bottle";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ValueLogEntry } from "@/types/bottle";

const CHART_COLORS = [
  "hsl(350, 42%, 32%)", "hsl(43, 52%, 54%)", "hsl(340, 50%, 60%)",
  "hsl(45, 70%, 60%)", "hsl(25, 60%, 40%)", "hsl(180, 40%, 40%)",
  "hsl(30, 70%, 30%)", "hsl(120, 30%, 40%)", "hsl(50, 60%, 50%)",
  "hsl(270, 40%, 45%)",
];

interface AnalyticsPanelProps {
  open: boolean;
  onClose: () => void;
  bottles: Bottle[];
  valueLog: ValueLogEntry[];
}

export function AnalyticsPanel({ open, onClose, bottles, valueLog }: AnalyticsPanelProps) {
  const active = useMemo(() => bottles.filter(b => !b.isFinished), [bottles]);

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(b => { map[b.type] = (map[b.type] || 0) + b.quantity; });
    return BOTTLE_TYPES.filter(t => map[t]).map(t => ({ name: `${TYPE_ICONS[t]} ${t}`, value: map[t] }));
  }, [active]);

  const decadeData = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(b => {
      const decade = `${Math.floor(b.vintage / 10) * 10}s`;
      map[decade] = (map[decade] || 0) + b.quantity;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count }));
  }, [active]);

  const topRated = useMemo(() => [...active].sort((a, b) => b.rating - a.rating).slice(0, 5), [active]);
  const mostExpensive = useMemo(() => [...active].sort((a, b) => b.pricePaid - a.pricePaid).slice(0, 5), [active]);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="right" className="glass-card border-border bg-card w-full sm:w-[480px] overflow-y-auto">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <SheetTitle className="font-display text-xl">📊 Cellar Analytics</SheetTitle>
          <SheetDescription>Insights about your collection</SheetDescription>
        </div>

        <div className="space-y-8 mt-6 pb-8">
          {/* By Type Pie */}
          {typeData.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold mb-3">Bottles by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <Separator />

          {/* By Decade Bar */}
          {decadeData.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold mb-3">Bottles by Vintage Decade</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={decadeData}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(35, 40%, 95%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(35, 40%, 95%)", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(43, 52%, 54%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <Separator />

          {/* Value Over Time */}
          {valueLog.length > 1 && (
            <div>
              <h3 className="font-display text-sm font-semibold mb-3">Cellar Value Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={valueLog}>
                  <XAxis dataKey="date" tick={{ fill: "hsl(35, 40%, 95%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(35, 40%, 95%)", fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalValue" stroke="hsl(43, 52%, 54%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <Separator />

          {/* Top Rated */}
          {topRated.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold mb-2">🏆 Top Rated</h3>
              <div className="space-y-1">
                {topRated.map((b, i) => (
                  <div key={b.id} className="flex justify-between text-sm">
                    <span>{i + 1}. {b.name} ({b.vintage})</span>
                    <span className="text-primary font-semibold">{b.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Most Expensive */}
          {mostExpensive.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-semibold mb-2">💎 Most Expensive</h3>
              <div className="space-y-1">
                {mostExpensive.map((b, i) => (
                  <div key={b.id} className="flex justify-between text-sm">
                    <span>{i + 1}. {b.name} ({b.vintage})</span>
                    <span className="text-primary font-semibold">${b.pricePaid.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
