import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Decision } from "@/types/decision";
import { format, differenceInDays, isAfter, isBefore, addDays } from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, TrendingUp, Star, Calendar, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = ["hsl(239,84%,67%)", "hsl(263,70%,58%)", "hsl(142,71%,45%)"];

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent?: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", accent || "text-primary")} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Decision["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-warning/15 text-warning" },
    decided: { label: "Decided", cls: "bg-primary/15 text-primary" },
    outcome_recorded: { label: "Reviewed", cls: "bg-success/15 text-success" },
  };
  const s = map[status];
  return <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s.cls)}>{s.label}</span>;
}

export default function Dashboard({ decisions }: { decisions: Decision[] }) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = decisions.filter(d => {
      const created = new Date(d.dateCreated);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });
    const withQuality = decisions.filter(d => d.qualityScore !== null);
    const avgQuality = withQuality.length
      ? (withQuality.reduce((s, d) => s + (d.qualityScore || 0), 0) / withQuality.length).toFixed(1)
      : "—";
    return {
      total: decisions.length,
      pending: decisions.filter(d => d.status === "pending").length,
      avgQuality,
      thisMonth: thisMonth.length,
    };
  }, [decisions]);

  const statusData = useMemo(() => [
    { name: "Pending", value: decisions.filter(d => d.status === "pending").length },
    { name: "Decided", value: decisions.filter(d => d.status === "decided").length },
    { name: "Reviewed", value: decisions.filter(d => d.status === "outcome_recorded").length },
  ], [decisions]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    decisions.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [decisions]);

  const recent = useMemo(() =>
    [...decisions].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).slice(0, 5),
    [decisions]
  );

  const upcoming = useMemo(() => {
    const now = new Date();
    const soon = addDays(now, 7);
    return decisions
      .filter(d => d.deadline && d.status === "pending" && isAfter(new Date(d.deadline), now) && isBefore(new Date(d.deadline), soon))
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  }, [decisions]);

  const dueForReflection = useMemo(() =>
    decisions.filter(d => d.status === "decided" && differenceInDays(new Date(), new Date(d.dateCreated)) >= 30),
    [decisions]
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your decision-making at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Decisions" value={stats.total} icon={TrendingUp} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} accent="text-warning" />
        <StatCard label="Avg Quality" value={stats.avgQuality} icon={Star} accent="text-success" />
        <StatCard label="This Month" value={stats.thisMonth} icon={Calendar} />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium mb-4">Decision Health</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} strokeWidth={0}>
                  {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[i] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium mb-4">By Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(239,84%,67%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No decisions yet</p>
          )}
        </div>
      </div>

      {/* Recent + Upcoming row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Recent Decisions</h3>
            <Link to="/decisions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No decisions yet. <Link to="/create" className="text-primary hover:underline">Create one!</Link></p>
            ) : recent.map(d => (
              <Link key={d.id} to={`/decision/${d.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(d.dateCreated), "MMM d, yyyy")}</p>
                </div>
                <StatusBadge status={d.status} />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Upcoming Deadlines
              </h3>
              <div className="space-y-2">
                {upcoming.map(d => {
                  const days = differenceInDays(new Date(d.deadline!), new Date());
                  return (
                    <Link key={d.id} to={`/decision/${d.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm truncate">{d.title}</span>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", days <= 2 ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>
                        {days}d left
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {dueForReflection.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-3">💭 Due for Reflection</h3>
              <div className="space-y-2">
                {dueForReflection.map(d => (
                  <Link key={d.id} to={`/decision/${d.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                    <span className="truncate">{d.title}</span>
                    <span className="text-xs text-muted-foreground">{differenceInDays(new Date(), new Date(d.dateCreated))}d ago</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
