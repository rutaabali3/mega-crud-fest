import { MoreVertical, Clock, Archive, Trash2 } from "lucide-react";
import { CraftProject, PROJECT_TYPES, TYPE_COLORS } from "@/types/craft";
import { ProgressRing } from "@/components/ProgressRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { format, isPast, differenceInDays } from "date-fns";

interface ProjectCardProps {
  project: CraftProject;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onLogSession?: (id: string) => void;
}

export function ProjectCard({ project, onArchive, onDelete, onLogSession }: ProjectCardProps) {
  const navigate = useNavigate();
  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.type);

  const getUrgency = () => {
    if (!project.targetEndDate) return null;
    const target = new Date(project.targetEndDate);
    if (isPast(target)) return "overdue";
    const days = differenceInDays(target, new Date());
    if (days <= 7) return "close";
    return "on-track";
  };

  const urgency = getUrgency();
  const urgencyColors = {
    "on-track": "bg-craft-sage/20 text-craft-sage",
    close: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    overdue: "bg-destructive/20 text-destructive",
  };

  return (
    <div
      className="bg-card rounded-2xl border shadow-sm card-hover cursor-pointer overflow-hidden"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      {/* Photo */}
      <div className="h-32 bg-muted overflow-hidden">
        {project.photoURL ? (
          <img src={project.photoURL} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-accent">
            {typeInfo?.emoji || "✂️"}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm truncate text-card-foreground">
              {project.title}
            </h3>
            <Badge variant="secondary" className={cn("text-[10px] mt-1", TYPE_COLORS[project.type])}>
              {typeInfo?.emoji} {typeInfo?.label}
            </Badge>
          </div>
          <ProgressRing progress={project.progress} size={40} strokeWidth={3} />
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{project.totalHoursSpent.toFixed(1)}h</span>
          {urgency && (
            <Badge variant="secondary" className={cn("text-[10px] ml-auto", urgencyColors[urgency])}>
              {urgency === "overdue" ? "Overdue" : urgency === "close" ? "Due soon" : format(new Date(project.targetEndDate), "MMM d")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
          {onLogSession && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 flex-1"
              onClick={() => onLogSession(project.id)}
            >
              <Clock className="h-3 w-3 mr-1" /> Log Session
            </Button>
          )}
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onArchive(project.id)}>
                  <Archive className="h-4 w-4 mr-2" /> Archive
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{project.title}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone. The project and all its data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(project.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
