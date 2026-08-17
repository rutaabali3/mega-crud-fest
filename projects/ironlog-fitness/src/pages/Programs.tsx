import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Program, ProgramDay } from "@/types";
import { ProgramModal } from "@/components/ProgramModal";
import { ProgramDetailView } from "@/components/ProgramDetailView";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Programs() {
  const { programs, setPrograms } = useWorkout();
  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewProgram, setViewProgram] = useState<Program | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (program: Program) => {
    if (editProgram) {
      setPrograms(programs.map((p) => (p.id === program.id ? program : p)));
    } else {
      setPrograms([...programs, program]);
    }
    setEditProgram(null);
    setShowCreate(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setPrograms(programs.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  if (viewProgram) {
    const currentProgram = programs.find((p) => p.id === viewProgram.id) || viewProgram;
    return (
      <ProgramDetailView
        program={currentProgram}
        onBack={() => setViewProgram(null)}
        onEdit={() => { setEditProgram(currentProgram); setViewProgram(null); }}
      />
    );
  }

  return (
    <div>
      <TopBar title="Programs" />

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreate(true)} className="rounded-full gap-2 font-bold">
          <Plus className="h-4 w-4" /> Create Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No programs yet. Create your first training program!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((p) => {
            const totalExercises = p.days.reduce((a, d) => a + d.exercises.length, 0);
            return (
              <Card
                key={p.id}
                className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)] cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setViewProgram(p)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {p.daysPerWeek} days/week
                        </span>
                        <span className="text-xs text-muted-foreground">{totalExercises} exercises</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {format(parseISO(p.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditProgram(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {(showCreate || editProgram) && (
        <ProgramModal
          program={editProgram}
          onSave={handleSave}
          onClose={() => { setEditProgram(null); setShowCreate(false); }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this program.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
