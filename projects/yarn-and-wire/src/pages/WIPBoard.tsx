import { useState } from "react";
import { useCraft } from "@/context/CraftContext";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState } from "@/components/EmptyState";
import { PROJECT_TYPES } from "@/types/craft";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function WIPBoard() {
  const { filteredProjects, archiveProject, deleteProject, addSession } = useCraft();
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [logSessionId, setLogSessionId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [sessionHours, setSessionHours] = useState("");
  const [sessionNote, setSessionNote] = useState("");

  const wipProjects = filteredProjects
    .filter((p) => p.status === "wip")
    .filter((p) => typeFilter === "all" || p.type === typeFilter)
    .sort((a, b) => {
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "targetDate") return (a.targetEndDate || "z").localeCompare(b.targetEndDate || "z");
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const notStarted = wipProjects.filter((p) => p.progress === 0);
  const inProgress = wipProjects.filter((p) => p.progress > 0 && p.progress < 80);
  const almostDone = wipProjects.filter((p) => p.progress >= 80);

  const handleLogSession = () => {
    if (!logSessionId || !sessionHours) return;
    addSession(logSessionId, {
      date: sessionDate.toISOString(),
      hoursLogged: Number(sessionHours),
      note: sessionNote,
    });
    toast({ title: "Session logged! ⏱️" });
    setLogSessionId(null);
    setSessionHours("");
    setSessionNote("");
    setSessionDate(new Date());
  };

  const handleArchive = (id: string) => {
    archiveProject(id);
    toast({ title: "Project archived 📦" });
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    toast({ title: "Project deleted 🗑️" });
  };

  const renderColumn = (title: string, emoji: string, projects: typeof wipProjects) => (
    <div className="flex-1 min-w-[280px]">
      <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
        {emoji} {title}
        <Badge variant="secondary" className="text-xs">{projects.length}</Badge>
      </h2>
      <div className="space-y-3">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onLogSession={setLogSessionId}
          />
        ))}
      </div>
    </div>
  );

  if (wipProjects.length === 0 && typeFilter === "all") {
    return (
      <EmptyState
        emoji="🧶"
        title="No projects in progress yet"
        description="Start your first craft project and track your creative journey!"
        actionLabel="Create New Project"
        onAction={() => {/* handled by layout FAB */}}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={typeFilter === "all" ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setTypeFilter("all")}
          >
            All
          </Badge>
          {PROJECT_TYPES.map((t) => (
            <Badge
              key={t.value}
              variant={typeFilter === t.value ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setTypeFilter(t.value)}
            >
              {t.emoji} {t.label}
            </Badge>
          ))}
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] h-8 text-xs ml-auto">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="targetDate">Target Date</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {renderColumn("Not Started", "📋", notStarted)}
        {renderColumn("In Progress", "🔨", inProgress)}
        {renderColumn("Almost Done", "🎯", almostDone)}
      </div>

      {/* Log Session Dialog */}
      <Dialog open={!!logSessionId} onOpenChange={(v) => !v && setLogSessionId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Log Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(sessionDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={sessionDate} onSelect={(d) => d && setSessionDate(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Hours Spent</Label>
              <Input type="number" step="0.25" value={sessionHours} onChange={(e) => setSessionHours(e.target.value)} placeholder="1.5" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={sessionNote} onChange={(e) => setSessionNote(e.target.value)} placeholder="What did you work on?" rows={3} />
            </div>
            <Button onClick={handleLogSession} className="w-full" disabled={!sessionHours}>
              Save Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
