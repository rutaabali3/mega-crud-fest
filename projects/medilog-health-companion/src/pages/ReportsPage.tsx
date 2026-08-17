import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Medication, DoseLog, SymptomEntry } from "@/types";
import { parseISO, subDays, isBefore, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { FileDown } from "lucide-react";
import { generatePdf } from "@/utils/pdfExport";

interface ReportsPageProps {
  medications: Medication[];
  logs: DoseLog[];
  symptoms: SymptomEntry[];
}

const PERIODS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function ReportsPage({ medications, logs, symptoms }: ReportsPageProps) {
  const [periodDays, setPeriodDays] = useState(30);

  const periodLogs = useMemo(() => {
    const cutoff = subDays(new Date(), periodDays);
    return logs.filter((l) => {
      const d = parseISO(l.scheduledTime);
      return isBefore(cutoff, d) && l.status !== "pending";
    });
  }, [logs, periodDays]);

  // Overall adherence
  const overallAdherence = useMemo(() => {
    if (periodLogs.length === 0) return 0;
    const taken = periodLogs.filter((l) => l.status === "taken").length;
    return Math.round((taken / periodLogs.length) * 100);
  }, [periodLogs]);

  // Per-medication adherence
  const perMedAdherence = useMemo(() => {
    return medications
      .filter((m) => m.isActive)
      .map((med) => {
        const medLogs = periodLogs.filter((l) => l.medicationId === med.id);
        const taken = medLogs.filter((l) => l.status === "taken").length;
        const rate = medLogs.length > 0 ? Math.round((taken / medLogs.length) * 100) : 0;
        return { name: med.name, adherence: rate, color: med.color };
      });
  }, [medications, periodLogs]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const taken = periodLogs.filter((l) => l.status === "taken").length;
    const missed = periodLogs.filter((l) => l.status === "missed").length;
    const skipped = periodLogs.filter((l) => l.status === "skipped").length;
    return [
      { name: "Taken", value: taken, color: "hsl(160, 84%, 39%)" },
      { name: "Missed", value: missed, color: "hsl(350, 89%, 60%)" },
      { name: "Skipped", value: skipped, color: "hsl(38, 92%, 50%)" },
    ];
  }, [periodLogs]);

  // Symptom frequency (weekly)
  const symptomFrequency = useMemo(() => {
    const cutoff = subDays(new Date(), periodDays);
    const filtered = symptoms.filter((s) => isBefore(cutoff, parseISO(s.date)));
    const weekMap = new Map<string, number>();
    filtered.forEach((s) => {
      const week = format(parseISO(s.date), "'W'w");
      weekMap.set(week, (weekMap.get(week) || 0) + 1);
    });
    return Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [symptoms, periodDays]);

  const handleExport = () => {
    generatePdf(medications, logs, symptoms);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <Button onClick={handleExport} className="bg-primary hover:bg-primary/90">
          <FileDown className="h-4 w-4 mr-2" /> Export for Doctor
        </Button>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <Button
            key={p.days}
            variant={periodDays === p.days ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriodDays(p.days)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Overall adherence */}
      <Card className="bg-card border-border rounded-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-5xl font-bold text-primary">{overallAdherence}%</p>
          <p className="text-sm text-muted-foreground mt-1">Overall adherence ({periodDays} days)</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Per-medication adherence */}
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Per-Medication Adherence</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perMedAdherence} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 17%)", borderRadius: "8px", color: "hsl(210, 40%, 98%)" }} />
                <Bar dataKey="adherence" radius={[0, 4, 4, 0]}>
                  {perMedAdherence.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status donut */}
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Dose Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 17%)", borderRadius: "8px", color: "hsl(210, 40%, 98%)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Symptom frequency */}
      {symptomFrequency.length > 0 && (
        <Card className="bg-card border-border rounded-2xl">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">Symptom Frequency Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={symptomFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 11%)", border: "1px solid hsl(217, 33%, 17%)", borderRadius: "8px", color: "hsl(210, 40%, 98%)" }} />
                <Line type="monotone" dataKey="count" stroke="hsl(172, 82%, 32%)" strokeWidth={2} dot={{ fill: "hsl(172, 82%, 32%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
