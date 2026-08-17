import { format, parseISO, differenceInDays } from "date-fns";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogProgressDialog } from "@/components/LogProgressDialog";
import type { Goal } from "@/types/goal";
import { getTotalProgress, getProgressPercent, isCompleted, isOverdue } from "@/hooks/useGoals";

interface Props {
  goal: Goal;
  onLog: (goalId: string, amount: number, date: string, note?: string) => void;
  onClick: () => void;
}

export function GoalCard({ goal, onLog, onClick }: Props) {
  const total = getTotalProgress(goal);
  const percent = getProgressPercent(goal);
  const completed = isCompleted(goal);
  const overdue = isOverdue(goal);
  const daysLeft = differenceInDays(parseISO(goal.deadline), new Date());

  return (
    <Card
      className="glass cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group"
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base leading-tight pr-2">{goal.title}</h3>
          {completed ? (
            <Badge className="bg-success text-success-foreground shrink-0">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Done
            </Badge>
          ) : overdue ? (
            <Badge variant="destructive" className="shrink-0">
              <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">
              <Clock className="h-3 w-3 mr-1" /> {daysLeft}d left
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {total.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
            </span>
            <span className="font-semibold">{percent.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary progress-bar-animated"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            Due {format(parseISO(goal.deadline), "MMM d, yyyy")}
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <LogProgressDialog goal={goal} onLog={onLog} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
