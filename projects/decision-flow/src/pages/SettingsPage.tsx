import { useState, useRef } from "react";
import { AppSettings } from "@/types/decision";
import { Decision } from "@/types/decision";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload, Trash2, AlertTriangle, Moon, Sun, Eye, Tag } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onExport: () => void;
  onImport: (decisions: Decision[], mode: "merge" | "replace") => void;
  onClearAll: () => void;
}

export default function SettingsPage({ settings, onUpdateSettings, onExport, onImport, onClearAll }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        onImport(data, importMode);
        toast.success(`Imported ${data.length} decisions (${importMode})`);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold gradient-text">Settings</h1>
      </div>

      <div className="glass-card p-5 space-y-5">
        <h3 className="font-medium text-sm">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <Label>Dark Mode</Label>
          </div>
          <Switch checked={settings.darkMode} onCheckedChange={v => onUpdateSettings({ darkMode: v })} />
        </div>
      </div>

      <div className="glass-card p-5 space-y-5">
        <h3 className="font-medium text-sm">Display</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <Label>Show confidence scores on cards</Label>
          </div>
          <Switch checked={settings.showConfidence} onCheckedChange={v => onUpdateSettings({ showConfidence: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Label>Show bias tags on timeline</Label>
          </div>
          <Switch checked={settings.showBiasTags} onCheckedChange={v => onUpdateSettings({ showBiasTags: v })} />
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-medium text-sm">Data</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => { onExport(); toast.success("Exported!"); }}>
            <Download className="h-3 w-3 mr-1" /> Export All Data
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1" /> Import
            </Button>
            <select
              value={importMode}
              onChange={e => setImportMode(e.target.value as "merge" | "replace")}
              className="text-xs bg-secondary text-secondary-foreground rounded px-2 py-1 border-0"
            >
              <option value="merge">Merge</option>
              <option value="replace">Replace</option>
            </select>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
        </div>
      </div>

      <div className="glass-card p-5 border-destructive/30">
        <h3 className="font-medium text-sm text-destructive mb-3">Danger Zone</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm"><Trash2 className="h-3 w-3 mr-1" /> Clear All Data</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Clear All Data?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete ALL decisions and reset the app. This cannot be undone. Consider exporting first.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onClearAll(); toast.success("All data cleared"); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Clear Everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-medium text-sm mb-2">About</h3>
        <p className="text-xs text-muted-foreground">Decision Journal v1.0 — Track your choices, analyze outcomes, and improve your decision-making over time. All data stored locally in your browser.</p>
      </div>
    </div>
  );
}
