import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { Transaction } from "@/types/transaction";
import { chartColors } from "@/lib/categoryIcons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ReportsProps {
  transactions: Transaction[];
}

const Reports = ({ transactions }: ReportsProps) => {
  const [months, setMonths] = useState("6");

  const monthlyData = useMemo(() => {
    const count = parseInt(months);
    const now = new Date();
    const monthIntervals = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), count - 1),
      end: endOfMonth(now),
    });

    return monthIntervals.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const monthTxns = transactions.filter((t) => {
        const d = parseISO(t.date);
        return d >= monthStart && d <= monthEnd;
      });
      const income = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: format(monthStart, "MMM yyyy"), income, expenses };
    });
  }, [transactions, months]);

  const barData = {
    labels: monthlyData.map((d) => d.label),
    datasets: [
      {
        label: "Income",
        data: monthlyData.map((d) => d.income),
        backgroundColor: "hsl(142, 76%, 36%)",
        borderRadius: 6,
      },
      {
        label: "Expenses",
        data: monthlyData.map((d) => d.expenses),
        backgroundColor: "hsl(0, 84%, 60%)",
        borderRadius: 6,
      },
    ],
  };

  const categoryBreakdown = useMemo(() => {
    const expenseTxns = transactions.filter((t) => t.type === "expense");
    const grouped: Record<string, number> = {};
    expenseTxns.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return grouped;
  }, [transactions]);

  const pieData = {
    labels: Object.keys(categoryBreakdown),
    datasets: [
      {
        data: Object.values(categoryBreakdown),
        backgroundColor: chartColors.slice(0, Object.keys(categoryBreakdown).length),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>

      <div className="flex items-center gap-3">
        <Label>Time range:</Label>
        <Select value={months} onValueChange={setMonths}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No data yet. Add some transactions!</p>
            ) : (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "hsl(240, 10%, 90%, 0.3)" } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">All-Time Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {Object.keys(categoryBreakdown).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No expenses yet.</p>
            ) : (
              <div className="w-full max-w-[280px]">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom", labels: { padding: 16 } } },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
