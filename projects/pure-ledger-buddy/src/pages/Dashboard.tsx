import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { format } from "date-fns";
import { Transaction } from "@/types/transaction";
import { chartColors } from "@/lib/categoryIcons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionModal } from "@/components/TransactionModal";
import { cn } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, "id">) => void;
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthTransactions: Transaction[];
  onNavigate: (page: string) => void;
}

const Dashboard = ({
  transactions,
  addTransaction,
  totalBalance,
  currentMonthIncome,
  currentMonthExpenses,
  currentMonthTransactions,
  onNavigate,
}: DashboardProps) => {
  const [addOpen, setAddOpen] = useState(false);

  const categoryBreakdown = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === "expense");
    const grouped: Record<string, number> = {};
    expenses.forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return grouped;
  }, [currentMonthTransactions]);

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

  const monthBalance = currentMonthIncome - currentMonthExpenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
      </div>

      {/* Total Balance */}
      <Card className="glass overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className={cn(
            "text-4xl md:text-5xl font-bold tracking-tight",
            totalBalance >= 0 ? "text-success" : "text-destructive"
          )}>
            ${Math.abs(totalBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          {totalBalance < 0 && <p className="text-xs text-destructive mt-1">Deficit</p>}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass animate-scale-in">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/15 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="text-xl font-bold text-success">
                ${currentMonthIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass animate-scale-in" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-xl font-bold text-destructive">
                ${currentMonthExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass animate-scale-in" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net This Month</p>
              <p className={cn("text-xl font-bold", monthBalance >= 0 ? "text-success" : "text-destructive")}>
                ${Math.abs(monthBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <Card className="glass">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
          {Object.keys(categoryBreakdown).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No expenses this month yet.</p>
              <Button variant="link" className="mt-2" onClick={() => setAddOpen(true)}>
                Add your first transaction
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-[300px]">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "bottom", labels: { padding: 16, usePointStyle: true } },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Button variant="link" size="sm" onClick={() => onNavigate("transactions")}>
              View all
            </Button>
          </div>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions
                .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
                .slice(0, 5)
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{t.category}</p>
                      <p className="text-xs text-muted-foreground">{t.note || format(new Date(t.date), "MMM d")}</p>
                    </div>
                    <p className={cn(
                      "font-semibold",
                      t.type === "income" ? "text-success" : "text-destructive"
                    )}>
                      {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAB */}
      <Button
        onClick={() => setAddOpen(true)}
        size="lg"
        className="fixed bottom-20 md:bottom-8 right-6 h-14 w-14 rounded-full shadow-xl z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TransactionModal open={addOpen} onOpenChange={setAddOpen} onSave={addTransaction} />
    </div>
  );
};

export default Dashboard;
