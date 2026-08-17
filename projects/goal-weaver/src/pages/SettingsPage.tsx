import { useRef } from "react";
import { Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Goal } from "@/types/goal";
import { toast } from "sonner";

interface Props {
  onExport: () => string;
  onImport: (data: Goal[]) => void;
  onClearAll: () => void;
}

export default function SettingsPage({ onExport, onImport, onClearAll }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = onExport();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goalforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        onImport(data);
        toast.success(`Imported ${data.length} goals!`);
      } catch {
        toast.error("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold gradient-text">Settings</h1>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download all your goals and progress as a JSON file.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export JSON
          </Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Restore goals from a previously exported JSON file. This will replace all current data.</CardDescription>
        </CardHeader>
        <CardContent>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Import JSON
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete all goals and progress data.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete all your goals and progress logs. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { onClearAll(); toast.success("All data cleared."); }}>Yes, delete everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
