import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Archive, ArchiveRestore, CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LogProgressDialog } from "@/components/LogProgressDialog";
import type { Goal } from "@/types/goal";
import { UNIT_OPTIONS } from "@/types/goal";
import { getTotalProgress, getProgressPercent, isCompleted, isOverdue } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";

interface Props {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<Pick<Goal, "title" | "unit" | "target" | "deadline">>) => void;
  onLog: (goalId: string, amount: number, date: string, note?: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteLog: (goalId: string, logId: string) => void;
}

export function GoalDetailDialog({ goal, open, onOpenChange, onUpdate, onLog, onArchive, onUnarchive, onDelete, onDeleteLog }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCustomUnit, setEditCustomUnit] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editDeadline, setEditDeadline] = useState<Date>();

  if (!goal) return null;

  const total = getTotalProgress(goal);
  const percent = getProgressPercent(goal);
  const completed = isCompleted(goal);
  const overdue = isOverdue(goal);
  const sortedLogs = [...goal.progressLogs].sort((a, b) => b.date.localeCompare(a.date));

  const startEdit = () => {
    const isPreset = (UNIT_OPTIONS as readonly string[]).includes(goal.unit);
    setEditTitle(goal.title);
    setEditUnit(isPreset ? goal.unit : "custom");
    setEditCustomUnit(isPreset ? "" : goal.unit);
    setEditTarget(String(goal.target));
    setEditDeadline(parseISO(goal.deadline));
    setEditing(true);
  };

  const saveEdit = () => {
    const finalUnit = editUnit === "custom" ? editCustomUnit.trim() : editUnit;
    const t = parseFloat(editTarget);
    if (!editTitle.trim() || !finalUnit || isNaN(t) || t <= 0 || !editDeadline) return;
    onUpdate(goal.id, { title: editTitle.trim(), unit: finalUnit, target: t, deadline: format(editDeadline, "yyyy-MM-dd") });
    setEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {goal.title}
            {completed && <Badge className="bg-success text-success-foreground">Completed</Badge>}
            {overdue && <Badge variant="destructive">Overdue</Badge>}
            {goal.isArchived && <Badge variant="secondary">Archived</Badge>}
          </DialogTitle>
          <DialogDescription>
            {total.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit} · Deadline: {format(parseISO(goal.deadline), "PPP")}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{percent.toFixed(1)}%</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full gradient-primary progress-bar-animated" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="space-y-3 border rounded-lg p-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={editUnit} onValueChange={setEditUnit}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
                {editUnit === "custom" && <Input value={editCustomUnit} onChange={(e) => setEditCustomUnit(e.target.value)} placeholder="Custom unit" />}
              </div>
              <div className="space-y-2">
                <Label>Target</Label>
                <Input type="number" min="0.01" step="any" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDeadline ? format(editDeadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={editDeadline} onSelect={setEditDeadline} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit} size="sm">Save</Button>
              <Button onClick={() => setEditing(false)} size="sm" variant="outline">Cancel</Button>
            </div>
          </div>
        ) : null}

        {/* Progress logs table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Progress History ({sortedLogs.length})</h4>
            <LogProgressDialog goal={goal} onLog={onLog} />
          </div>
          {sortedLogs.length > 0 ? (
            <div className="max-h-60 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{format(parseISO(log.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="font-medium">+{log.amount} {goal.unit}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.note || "—"}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDeleteLog(goal.id, log.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No progress logged yet.</p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={startEdit} className="gap-1">
            <Edit className="h-3 w-3" /> Edit Goal
          </Button>
          {goal.isArchived ? (
            <Button variant="outline" size="sm" onClick={() => { onUnarchive(goal.id); onOpenChange(false); }} className="gap-1">
              <ArchiveRestore className="h-3 w-3" /> Unarchive
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => { onArchive(goal.id); onOpenChange(false); }} className="gap-1">
              <Archive className="h-3 w-3" /> Archive
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1">
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{goal.title}"?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. The goal and all its progress data will be permanently removed.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { onDelete(goal.id); onOpenChange(false); }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
