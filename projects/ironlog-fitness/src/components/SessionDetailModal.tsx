import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkoutSession } from "@/types";
import { format, parseISO } from "date-fns";
import { Check, X } from "lucide-react";

interface Props {
  session: WorkoutSession;
  onClose: () => void;
}

export function SessionDetailModal({ session, onClose }: Props) {
  const totalVol = session.exercises.reduce(
    (a, ex) => a + ex.sets.reduce((sa, s) => sa + (s.completed ? s.weight * s.reps : 0), 0), 0
  );
  const completedSets = session.exercises.reduce(
    (a, ex) => a + ex.sets.filter((s) => s.completed).length, 0
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{session.dayLabel}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(parseISO(session.date), "EEE, MMM d yyyy")} · {session.durationMinutes} min · {totalVol.toLocaleString()} kg total · {completedSets} sets
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {session.exercises.map((ex) => (
            <div key={ex.exerciseId} className="p-3 rounded-lg bg-secondary/50">
              <p className="font-bold text-sm text-foreground mb-2">{ex.name}</p>
              <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground font-semibold mb-1">
                <span>SET</span><span>WEIGHT</span><span>REPS</span><span>✓</span>
              </div>
              {ex.sets.map((s) => (
                <div key={s.setNumber} className={`grid grid-cols-4 gap-1 text-sm py-1 ${s.completed ? "text-foreground" : "text-muted-foreground"}`}>
                  <span>{s.setNumber}</span>
                  <span>{s.weight} kg</span>
                  <span>{s.reps}</span>
                  <span>{s.completed ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />}</span>
                </div>
              ))}
            </div>
          ))}

          {session.notes && (
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground font-semibold mb-1">Notes</p>
              <p className="text-sm text-foreground">{session.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
