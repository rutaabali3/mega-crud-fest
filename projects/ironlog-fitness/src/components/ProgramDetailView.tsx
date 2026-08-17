import { Program } from "@/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  program: Program;
  onBack: () => void;
  onEdit: () => void;
}

export function ProgramDetailView({ program, onBack, onEdit }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      <TopBar title={program.name} />
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit} className="gap-1 ml-auto">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="space-y-4">
        {program.days.map((day) => (
          <Card key={day.dayIndex} className="bg-card border-border shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">{day.label}</h3>
                <Button
                  size="sm"
                  className="rounded-full gap-1 font-bold"
                  onClick={() => navigate(`/log?programId=${program.id}&dayIndex=${day.dayIndex}`)}
                >
                  <Zap className="h-3.5 w-3.5" /> Start
                </Button>
              </div>
              <div className="space-y-1.5">
                {day.exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-secondary/40 text-sm">
                    <span className="font-semibold text-foreground">{ex.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {ex.sets} × {ex.reps} · {ex.restSeconds}s rest
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
