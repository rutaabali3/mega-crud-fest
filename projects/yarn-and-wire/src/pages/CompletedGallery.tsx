import { useCraft } from "@/context/CraftContext";
import { EmptyState } from "@/components/EmptyState";
import { PROJECT_TYPES, TYPE_COLORS } from "@/types/craft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Eye, Archive, MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CompletedGallery() {
  const { filteredProjects, archiveProject, deleteProject } = useCraft();
  const navigate = useNavigate();

  const completed = filteredProjects.filter((p) => p.status === "completed");

  if (completed.length === 0) {
    return (
      <EmptyState
        emoji="🖼️"
        title="No completed projects yet"
        description="Finish your first project and it'll appear here in your gallery!"
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-4">Completed Gallery</h1>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {completed.map((p) => {
          const typeInfo = PROJECT_TYPES.find((t) => t.value === p.type);
          const materialsCost = p.materials.reduce((s, m) => s + m.costPaid, 0);
          const profit = p.estimatedSellingPrice - materialsCost;

          return (
            <div key={p.id} className="break-inside-avoid bg-card rounded-2xl border shadow-sm overflow-hidden card-hover group relative">
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {p.photoURL ? (
                  <img src={p.photoURL} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-accent">
                    {typeInfo?.emoji || "✂️"}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/project/${p.id}`)}>
                    <Eye className="h-4 w-4 mr-1" /> Details
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { archiveProject(p.id); toast({ title: "Archived 📦" }); }}>
                    <Archive className="h-4 w-4 mr-1" /> Archive
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-card-foreground">{p.title}</h3>
                    <Badge variant="secondary" className={cn("text-[10px] mt-1", TYPE_COLORS[p.type])}>
                      {typeInfo?.emoji} {typeInfo?.label}
                    </Badge>
                  </div>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { archiveProject(p.id); toast({ title: "Archived 📦" }); }}>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{p.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { deleteProject(p.id); toast({ title: "Deleted 🗑️" }); }}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.totalHoursSpent.toFixed(1)}h</span>
                  <span>{format(new Date(p.updatedAt), "MMM d, yyyy")}</span>
                </div>
                {p.estimatedSellingPrice > 0 && (
                  <Badge variant="secondary" className={cn("mt-2 text-xs", profit >= 0 ? "bg-craft-sage/20 text-craft-sage" : "bg-destructive/20 text-destructive")}>
                    {profit >= 0 ? `+$${profit.toFixed(0)} profit` : `-$${Math.abs(profit).toFixed(0)} loss`}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
