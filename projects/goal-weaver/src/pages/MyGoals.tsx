import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/components/GoalCard";
import { CreateGoalDialog } from "@/components/CreateGoalDialog";
import type { Goal } from "@/types/goal";
import { isCompleted, isOverdue } from "@/hooks/useGoals";

interface Props {
  goals: Goal[];
  onCreate: (data: { title: string; unit: string; target: number; deadline: string }) => void;
  onLog: (goalId: string, amount: number, date: string, note?: string) => void;
  onSelectGoal: (goal: Goal) => void;
}

export default function MyGoals({ goals, onCreate, onLog, onSelectGoal }: Props) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return goals.filter((g) => g.title.toLowerCase().includes(q));
  }, [goals, search]);

  const tabs = {
    active: filtered.filter((g) => !g.isArchived && !isCompleted(g) && !isOverdue(g)),
    completed: filtered.filter((g) => !g.isArchived && isCompleted(g)),
    overdue: filtered.filter((g) => !g.isArchived && isOverdue(g)),
    archived: filtered.filter((g) => g.isArchived),
  };

  const renderGrid = (list: Goal[]) =>
    list.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((g) => (
          <GoalCard key={g.id} goal={g} onLog={onLog} onClick={() => onSelectGoal(g)} />
        ))}
      </div>
    ) : (
      <p className="text-center text-muted-foreground py-12">No goals found.</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">My Goals</h1>
        <CreateGoalDialog onCreate={onCreate} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search goals..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({tabs.active.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tabs.completed.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({tabs.overdue.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({tabs.archived.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">{renderGrid(tabs.active)}</TabsContent>
        <TabsContent value="completed">{renderGrid(tabs.completed)}</TabsContent>
        <TabsContent value="overdue">{renderGrid(tabs.overdue)}</TabsContent>
        <TabsContent value="archived">{renderGrid(tabs.archived)}</TabsContent>
      </Tabs>
    </div>
  );
}
