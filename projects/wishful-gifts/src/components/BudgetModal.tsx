import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { WishItem } from "@/types/wishlist";
import { CURRENCIES } from "@/types/wishlist";

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  items: WishItem[];
  people: string[];
  budgets: Record<string, number>;
  onSetBudget: (person: string, amount: number) => void;
}

const CHART_COLORS = [
  "hsl(350, 92%, 71%)",
  "hsl(200, 80%, 60%)",
  "hsl(140, 60%, 50%)",
  "hsl(45, 90%, 60%)",
  "hsl(270, 60%, 60%)",
  "hsl(20, 80%, 60%)",
  "hsl(180, 60%, 50%)",
  "hsl(320, 70%, 60%)",
];

export function BudgetModal({ open, onClose, items, people, budgets, onSetBudget }: BudgetModalProps) {
  const [selectedPerson, setSelectedPerson] = useState("all");

  const summary = useMemo(() => {
    const filteredPeople = selectedPerson === "all" ? people : [selectedPerson];
    return filteredPeople.map((person) => {
      const personItems = items.filter((i) => i.forPerson === person);
      const total = personItems.reduce((s, i) => s + i.price, 0);
      const claimed = personItems.filter((i) => i.claimed || i.purchased).reduce((s, i) => s + i.price, 0);
      return {
        person,
        count: personItems.length,
        total,
        claimed,
        remaining: total - claimed,
        budget: budgets[person] || 0,
      };
    }).filter((r) => r.count > 0);
  }, [items, people, budgets, selectedPerson]);

  const chartData = summary.map((s) => ({ name: s.person, value: s.total }));
  const grandTotal = summary.reduce((s, r) => s + r.total, 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💰 Gift Budget Breakdown</DialogTitle>
          <DialogDescription>Track spending per person and set budget limits.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedPerson} onValueChange={setSelectedPerson}>
            <SelectTrigger>
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
              {people.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 font-medium">Person</th>
                  <th className="text-right p-2 font-medium">Items</th>
                  <th className="text-right p-2 font-medium">Total</th>
                  <th className="text-right p-2 font-medium">Claimed</th>
                  <th className="text-right p-2 font-medium">Remaining</th>
                  <th className="text-right p-2 font-medium">Budget</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.person} className="border-b last:border-0">
                    <td className="p-2 font-medium">{row.person}</td>
                    <td className="p-2 text-right">{row.count}</td>
                    <td className="p-2 text-right">${row.total.toLocaleString()}</td>
                    <td className="p-2 text-right">${row.claimed.toLocaleString()}</td>
                    <td className="p-2 text-right">${row.remaining.toLocaleString()}</td>
                    <td className="p-2 text-right">
                      <Input
                        type="number"
                        min="0"
                        value={row.budget || ""}
                        onChange={(e) => onSetBudget(row.person, Number(e.target.value))}
                        className="w-20 h-7 text-xs ml-auto"
                        placeholder="Set"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand total */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
            <span className="font-bold text-primary">Grand Total</span>
            <span className="font-bold text-primary">${grandTotal.toLocaleString()}</span>
          </div>

          {/* Over budget warnings */}
          {summary.map(
            (row) =>
              row.budget > 0 &&
              row.total > row.budget && (
                <div
                  key={row.person}
                  className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>{row.person}</strong> is ${(row.total - row.budget).toLocaleString()} over budget!
                  </span>
                </div>
              )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
