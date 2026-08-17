import { useCraft } from "@/context/CraftContext";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function CostCalculator() {
  const { projects, hourlyRate, setHourlyRate } = useCraft();

  const activeProjects = projects.filter((p) => p.status !== "archived");

  if (activeProjects.length === 0) {
    return (
      <EmptyState
        emoji="💰"
        title="No projects to calculate"
        description="Create some projects to see your cost breakdown here."
      />
    );
  }

  const rows = activeProjects.map((p) => {
    const materialsCost = p.materials.reduce((s, m) => s + m.costPaid, 0);
    const labourCost = p.totalHoursSpent * hourlyRate;
    const totalCost = materialsCost + labourCost;
    const profit = p.estimatedSellingPrice ? p.estimatedSellingPrice - totalCost : null;
    const margin = p.estimatedSellingPrice && profit !== null ? (profit / p.estimatedSellingPrice) * 100 : null;
    return { ...p, materialsCost, labourCost, totalCost, profit, margin };
  });

  const totalMaterials = rows.reduce((s, r) => s + r.materialsCost, 0);
  const totalHours = rows.reduce((s, r) => s + r.totalHoursSpent, 0);
  const totalProfit = rows.reduce((s, r) => s + (r.profit ?? 0), 0);

  const chartData = rows.filter(r => r.estimatedSellingPrice > 0).map((r) => ({
    name: r.title.length > 15 ? r.title.slice(0, 15) + "…" : r.title,
    "Selling Price": r.estimatedSellingPrice,
    "Total Cost": r.totalCost,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Cost Calculator</h1>
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Hourly Rate</Label>
          <div className="relative w-24">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
              className="pl-6 h-9"
            />
          </div>
          <span className="text-xs text-muted-foreground">/hr</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="text-right">Materials</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Labour</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Selling Price</TableHead>
              <TableHead className="text-right">Profit/Loss</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-right">${r.materialsCost.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.totalHoursSpent.toFixed(1)}</TableCell>
                <TableCell className="text-right">${r.labourCost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">${r.totalCost.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {r.estimatedSellingPrice ? `$${r.estimatedSellingPrice.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className={cn("text-right font-semibold", r.profit === null ? "text-muted-foreground" : r.profit >= 0 ? "text-craft-sage" : "text-destructive")}>
                  {r.profit !== null ? `${r.profit >= 0 ? "+" : ""}$${r.profit.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className={cn("text-right", r.margin === null ? "text-muted-foreground" : r.margin >= 0 ? "text-craft-sage" : "text-destructive")}>
                  {r.margin !== null ? `${r.margin.toFixed(0)}%` : "—"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">${totalMaterials.toFixed(2)}</TableCell>
              <TableCell className="text-right">{totalHours.toFixed(1)}</TableCell>
              <TableCell className="text-right">${(totalHours * hourlyRate).toFixed(2)}</TableCell>
              <TableCell className="text-right">${(totalMaterials + totalHours * hourlyRate).toFixed(2)}</TableCell>
              <TableCell />
              <TableCell className={cn("text-right", totalProfit >= 0 ? "text-craft-sage" : "text-destructive")}>
                {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {chartData.length > 0 && (
        <div className="bg-card rounded-2xl border shadow-sm p-4">
          <h2 className="font-display text-lg font-semibold mb-3">Cost vs Selling Price</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total Cost" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Selling Price" fill="hsl(var(--craft-sage))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
