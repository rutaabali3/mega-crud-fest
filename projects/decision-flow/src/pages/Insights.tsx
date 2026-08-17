import { useMemo } from "react";
import { Decision, ALL_CATEGORIES, ALL_BIAS_TAGS } from "@/types/decision";
import { differenceInDays, format } from "date-fns";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Lightbulb } from "lucide-react";

export default function Insights({ decisions }: { decisions: Decision[] }) {
  // Quality over time (monthly average)
  const qualityOverTime = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    decisions.filter(d => d.qualityScore && d.actualOutcomeDate).forEach(d => {
      const key = format(new Date(d.actualOutcomeDate!), "yyyy-MM");
      const entry = map.get(key) || { total: 0, count: 0 };
      entry.total += d.qualityScore!;
      entry.count++;
      map.set(key, entry);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, { total, count }]) => ({ month: format(new Date(month + "-01"), "MMM yy"), avg: +(total / count).toFixed(1) }));
  }, [decisions]);

  // Bias frequency
  const biasFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    decisions.forEach(d => d.biasTags.forEach(b => { counts[b] = (counts[b] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [decisions]);

  // Category quality radar
  const categoryQuality = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    decisions.filter(d => d.qualityScore).forEach(d => {
      if (!map[d.category]) map[d.category] = { total: 0, count: 0 };
      map[d.category].total += d.qualityScore!;
      map[d.category].count++;
    });
    return Object.entries(map).map(([category, { total, count }]) => ({ category, avg: +(total / count).toFixed(1) }));
  }, [decisions]);

  // Decision speed by category
  const decisionSpeed = useMemo(() => {
    const map: Record<string, number[]> = {};
    decisions.filter(d => d.status !== "pending").forEach(d => {
      const days = differenceInDays(new Date(d.dateCreated), new Date(d.dateCreated)); // simplified
      if (!map[d.category]) map[d.category] = [];
      map[d.category].push(days);
    });
    return Object.entries(map).map(([category, days]) => ({
      category,
      avgDays: +(days.reduce((s, d) => s + d, 0) / days.length).toFixed(1),
    }));
  }, [decisions]);

  // Confidence vs Quality scatter
  const confidenceVsQuality = useMemo(() =>
    decisions.filter(d => d.qualityScore).map(d => ({
      confidence: d.confidenceScore,
      quality: d.qualityScore!,
      title: d.title,
    })),
    [decisions]
  );

  // Auto-generated insights
  const insights = useMemo(() => {
    const texts: string[] = [];
    if (categoryQuality.length > 0) {
      const best = categoryQuality.reduce((a, b) => a.avg > b.avg ? a : b);
      texts.push(`Your ${best.category} decisions tend to score highest in quality (${best.avg} avg).`);
    }
    if (biasFrequency.length > 0) {
      const top = biasFrequency[0];
      texts.push(`You most often identify "${top.name}" as a bias (${top.value} times).`);
    }
    const reviewed = decisions.filter(d => d.qualityScore);
    if (reviewed.length >= 3) {
      const avg = (reviewed.reduce((s, d) => s + d.qualityScore!, 0) / reviewed.length).toFixed(1);
      texts.push(`Your overall decision quality averages ${avg}/5 across ${reviewed.length} reviewed decisions.`);
    }
    return texts;
  }, [decisions, categoryQuality, biasFrequency]);

  const hasData = decisions.length > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold gradient-text">Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Patterns and trends in your decision-making</p>
      </div>

      {!hasData ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Not enough data yet. Start making decisions!</p>
        </div>
      ) : (
        <>
          {/* Insight callouts */}
          {insights.length > 0 && (
            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-medium">Key Insights</h3>
              </div>
              {insights.map((text, i) => (
                <p key={i} className="text-sm text-muted-foreground">• {text}</p>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Quality over time */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-4">Quality Score Over Time</h3>
              {qualityOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={qualityOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,20%,20%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg" stroke="hsl(239,84%,67%)" strokeWidth={2} dot={{ fill: "hsl(263,70%,58%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-8">No quality data yet</p>}
            </div>

            {/* Bias frequency */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-4">Bias Tag Frequency</h3>
              {biasFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={biasFrequency} layout="vertical" margin={{ left: 100 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(263,70%,58%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-8">No bias tags yet</p>}
            </div>

            {/* Category quality radar */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-4">Category Quality</h3>
              {categoryQuality.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={categoryQuality}>
                    <PolarGrid stroke="hsl(230,20%,20%)" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Radar dataKey="avg" stroke="hsl(239,84%,67%)" fill="hsl(239,84%,67%)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-8">No quality data yet</p>}
            </div>

            {/* Confidence vs Quality */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium mb-4">Confidence vs Quality</h3>
              {confidenceVsQuality.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,20%,20%)" />
                    <XAxis dataKey="confidence" name="Confidence" domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: "Confidence", position: "bottom", fontSize: 10 }} />
                    <YAxis dataKey="quality" name="Quality" domain={[0, 5]} tick={{ fontSize: 11 }} label={{ value: "Quality", angle: -90, position: "insideLeft", fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter data={confidenceVsQuality} fill="hsl(263,70%,58%)" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : <p className="text-xs text-muted-foreground text-center py-8">Need outcome data</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
