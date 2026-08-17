import { useCraft } from "@/context/CraftContext";
import { EmptyState } from "@/components/EmptyState";
import { PROJECT_TYPES, TYPE_COLORS } from "@/types/craft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ArchivePage() {
  const { projects, restoreProject, deleteProject } = useCraft();
  const archived = projects.filter((p) => p.status === "archived");

  if (archived.length === 0) {
    return (
      <EmptyState
        emoji="📁"
        title="No archived projects"
        description="Projects you archive will appear here for safekeeping."
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Archived Projects</h1>
      <div className="grid gap-3">
        {archived.map((p) => {
          const typeInfo = PROJECT_TYPES.find((t) => t.value === p.type);
          return (
            <div key={p.id} className="flex items-center gap-4 bg-card rounded-2xl border shadow-sm p-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                {typeInfo?.emoji || "✂️"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold truncate text-card-foreground">{p.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className={cn("text-[10px]", TYPE_COLORS[p.type])}>
                    {typeInfo?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Archived {format(new Date(p.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => { restoreProject(p.id); toast({ title: "Project restored! 🧶" }); }}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Restore
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{p.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { deleteProject(p.id); toast({ title: "Deleted 🗑️" }); }}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
