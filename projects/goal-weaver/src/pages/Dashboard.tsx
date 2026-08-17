import { useMemo } from "react";
import { format, parseISO, getMonth, getYear } from "date-fns";
import { Target, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/GoalCard";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import type { Goal } from "@/types/goal";
import { getTotalProgress, isCompleted, isOverdue } from "@/hooks/useGoals";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  goals: Goal[];
  onCreate: (data: { title: string; unit: string; target: number; deadline: string }) => void;
  onLog: (goalId: string, amount: number, date: string, note?: string) => void;
  onSelectGoal: (goal: Goal) => void;
}

export default function Dashboard({ goals, onCreate, onLog, onSelectGoal }: Props) {
  const activeGoals = goals.filter((g) => !g.isArchived);
  const completedCount = activeGoals.filter(isCompleted).length;
  const overdueCount = activeGoals.filter(isOverdue).length;
  const inProgress = activeGoals.filter((g) => !isCompleted(g));

  // Yearly chart data: sum all log amounts by month for current year
  const chartData = useMemo(() => {
    const year = new Date().getFullYear();
    const monthly = Array(12).fill(0);
    goals.forEach((g) => {
      g.progressLogs.forEach((log) => {
        const d = parseISO(log.date);
        if (getYear(d) === year) {
          monthly[getMonth(d)] += log.amount;
        }
      });
    });
    return MONTHS.map((m, i) => ({ month: m, total: parseFloat(monthly[i].toFixed(2)) }));
  }, [goals]);

  const totalLogged = chartData.reduce((s, d) => s + d.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your goals and celebrate wins 🎯</p>
        </div>
        <CreateGoalDialog onCreate={onCreate} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeGoals.length}</p>
              <p className="text-xs text-muted-foreground">Active Goals</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueCount}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLogged.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Logged This Year</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly overview chart */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Yearly Overview ({new Date().getFullYear()})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" />
                    <stop offset="100%" stopColor="hsl(152, 68%, 50%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active goals grid */}
      {inProgress.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-3">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onLog={onLog} onClick={() => onSelectGoal(goal)} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No active goals yet</h3>
            <p className="text-muted-foreground text-sm">Create your first goal to start tracking progress!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
