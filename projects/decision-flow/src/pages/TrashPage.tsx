import { Decision } from "@/types/decision";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  trashedDecisions: Decision[];
  onRestore: (id: string) => void;
  onPermanentlyDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export default function TrashPage({ trashedDecisions, onRestore, onPermanentlyDelete, onEmptyTrash }: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold gradient-text">Trash</h1>
          <p className="text-muted-foreground text-sm mt-1">{trashedDecisions.length} items</p>
        </div>
        {trashedDecisions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="h-3 w-3 mr-1" /> Empty Trash</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Empty Trash?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete all {trashedDecisions.length} trashed decisions. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { onEmptyTrash(); toast.success("Trash emptied"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {trashedDecisions.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Trash is empty</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {trashedDecisions.map(d => (
            <div key={d.id} className="glass-card p-4">
              <h4 className="font-serif font-semibold mb-1 truncate">{d.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="bg-secondary px-2 py-0.5 rounded-full">{d.category}</span>
                <span>{format(new Date(d.dateCreated), "MMM d, yyyy")}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { onRestore(d.id); toast.success("Restored!"); }}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Restore
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                      <AlertDialogDescription>"{d.title}" will be permanently removed.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { onPermanentlyDelete(d.id); toast.success("Deleted permanently"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
