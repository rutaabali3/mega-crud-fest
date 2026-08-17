import { useMemo } from "react";
import { useVocabContext } from "@/lib/VocabContext";
import { getActivity } from "@/lib/storage";
import { Book, CheckCircle, Flame, CalendarDays, ArrowUpDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useState } from "react";

const COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];
const MASTERY_COLORS = ["#94a3b8", "#EF4444", "#F59E0B", "#EAB308", "#84cc16", "#10B981"];

const StatsPage = () => {
  const { entries, settings } = useVocabContext();
  const activity = getActivity();
  const [sortKey, setSortKey] = useState<string>("word");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const totalWords = entries.length;
  const masteredWords = entries.filter(e => e.isMastered).length;
  const dueToday = entries.filter(e => !e.isMastered && new Date(e.nextReviewDate) <= new Date()).length;

  // Mastery distribution
  const masteryData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    entries.forEach(e => counts[e.masteryLevel]++);
    return counts.map((count, level) => ({ name: `Level ${level}`, count, fill: MASTERY_COLORS[level] }));
  }, [entries]);

  // By language
  const languageData = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => { map[e.targetLanguage] = (map[e.targetLanguage] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [entries]);

  // By difficulty
  const difficultyData = useMemo(() => {
    const map: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    entries.forEach(e => { map[e.difficulty]++; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [entries]);

  // Heatmap (last 90 days)
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({ date: key, count: activity[key] || 0 });
    }
    return days;
  }, [activity]);

  const maxActivity = Math.max(1, ...heatmapData.map(d => d.count));

  // Sortable table
  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "word": cmp = a.word.localeCompare(b.word); break;
        case "language": cmp = a.targetLanguage.localeCompare(b.targetLanguage); break;
        case "mastery": cmp = a.masteryLevel - b.masteryLevel; break;
        case "correct": cmp = a.timesCorrect - b.timesCorrect; break;
        case "incorrect": cmp = a.timesIncorrect - b.timesIncorrect; break;
        case "accuracy":
          const accA = a.timesCorrect + a.timesIncorrect > 0 ? a.timesCorrect / (a.timesCorrect + a.timesIncorrect) : 0;
          const accB = b.timesCorrect + b.timesIncorrect > 0 ? b.timesCorrect / (b.timesCorrect + b.timesIncorrect) : 0;
          cmp = accA - accB;
          break;
        case "nextReview": cmp = new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime(); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  }, [entries, sortKey, sortAsc]);

  const pageSize = 20;
  const pageEntries = sortedEntries.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedEntries.length / pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ label, sKey }: { label: string; sKey: string }) => (
    <button onClick={() => toggleSort(sKey)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
      {label} <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-xl font-bold">Stats & Mastery</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Book, label: "Total Words", value: totalWords, color: "text-primary" },
          { icon: CheckCircle, label: "Mastered", value: masteredWords, color: "text-success" },
          { icon: Flame, label: "Streak", value: settings.streakCount, color: "text-accent" },
          { icon: CalendarDays, label: "Due Today", value: dueToday, color: "text-destructive" },
        ].map(stat => (
          <div key={stat.label} className="border rounded-xl bg-card p-4 text-center">
            <stat.icon className={cn("h-6 w-6 mx-auto mb-2", stat.color)} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mastery Distribution */}
        <div className="border rounded-xl bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Mastery Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={masteryData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {masteryData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Language */}
        <div className="border rounded-xl bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Words by Language</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={languageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                {languageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Difficulty */}
        <div className="border rounded-xl bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Words by Difficulty</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={difficultyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                <Cell fill="#10B981" />
                <Cell fill="#F59E0B" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="border rounded-xl bg-card p-4">
          <h3 className="text-sm font-medium mb-3">Activity (Last 90 Days)</h3>
          <div className="grid grid-cols-[repeat(13,1fr)] gap-[3px]">
            {heatmapData.map(day => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} reviews`}
                className="aspect-square rounded-sm transition-default"
                style={{
                  backgroundColor: day.count === 0
                    ? "hsl(var(--muted))"
                    : `hsl(142 71% ${75 - (day.count / maxActivity) * 45}%)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mastery Table */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3"><SortHeader label="Word" sKey="word" /></th>
                <th className="text-left p-3 hidden sm:table-cell"><SortHeader label="Language" sKey="language" /></th>
                <th className="text-left p-3"><SortHeader label="Mastery" sKey="mastery" /></th>
                <th className="text-left p-3 hidden md:table-cell"><SortHeader label="Correct" sKey="correct" /></th>
                <th className="text-left p-3 hidden md:table-cell"><SortHeader label="Incorrect" sKey="incorrect" /></th>
                <th className="text-left p-3"><SortHeader label="Accuracy" sKey="accuracy" /></th>
                <th className="text-left p-3 hidden sm:table-cell"><SortHeader label="Next Review" sKey="nextReview" /></th>
              </tr>
            </thead>
            <tbody>
              {pageEntries.map(e => {
                const total = e.timesCorrect + e.timesIncorrect;
                const accuracy = total > 0 ? Math.round((e.timesCorrect / total) * 100) : 0;
                return (
                  <tr key={e.id} className="border-t hover:bg-muted/30 transition-default">
                    <td className="p-3 font-medium">{e.word}</td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">{e.targetLanguage}</td>
                    <td className="p-3">{e.masteryLevel}/5</td>
                    <td className="p-3 hidden md:table-cell">{e.timesCorrect}</td>
                    <td className="p-3 hidden md:table-cell">{e.timesIncorrect}</td>
                    <td className="p-3">{accuracy}%</td>
                    <td className="p-3 hidden sm:table-cell text-muted-foreground">{new Date(e.nextReviewDate).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-3 border-t">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-sm text-primary disabled:text-muted-foreground">← Prev</button>
            <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="text-sm text-primary disabled:text-muted-foreground">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
