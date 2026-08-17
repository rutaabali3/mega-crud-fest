import { useState } from "react";
import { useVocabContext } from "@/lib/VocabContext";
import { getVocab, saveVocab, clearAllData, seedData } from "@/lib/storage";
import { VocabEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { settings, updateSettings, entries, refresh } = useVocabContext();
  const [resetInput, setResetInput] = useState("");
  const [showReset, setShowReset] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify(getVocab(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocab_bank_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported! 📦", description: `${entries.length} words exported.` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported: VocabEntry[] = JSON.parse(reader.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        const existing = getVocab();
        const existingKeys = new Set(existing.map(e => `${e.word.toLowerCase()}|${e.targetLanguage.toLowerCase()}`));
        const newEntries = imported.filter(e => !existingKeys.has(`${e.word.toLowerCase()}|${e.targetLanguage.toLowerCase()}`));
        const merged = [...existing, ...newEntries];
        saveVocab(merged);
        refresh();
        toast({
          title: "Import complete! 📥",
          description: `${newEntries.length} new words added, ${imported.length - newEntries.length} duplicates skipped.`,
        });
      } catch {
        toast({ title: "Import failed ❌", description: "Invalid JSON file. No data was modified.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (resetInput !== "RESET") return;
    clearAllData();
    seedData();
    refresh();
    setShowReset(false);
    setResetInput("");
    toast({ title: "Data reset", description: "All data has been cleared and seed data restored." });
  };

  const lastUpdated = entries.length > 0
    ? new Date(Math.max(...entries.map(e => new Date(e.updatedAt).getTime()))).toLocaleDateString()
    : "N/A";

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>

      <div className="space-y-4">
        <div>
          <Label>Daily Review Goal</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={settings.dailyGoal}
            onChange={e => updateSettings({ dailyGoal: Math.min(50, Math.max(1, parseInt(e.target.value) || 1)) })}
            className="mt-1 w-32"
          />
        </div>

        <div>
          <Label>Default Language</Label>
          <Input
            value={settings.preferredLanguage}
            onChange={e => updateSettings({ preferredLanguage: e.target.value })}
            placeholder="e.g. Spanish"
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Dark Mode</Label>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={checked => updateSettings({ darkMode: checked })}
          />
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-medium">Data Management</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>Export Vocabulary</Button>
          <div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
            <Button variant="outline" asChild>
              <label htmlFor="import-file" className="cursor-pointer">Import Vocabulary</label>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        {!showReset ? (
          <Button variant="destructive" onClick={() => setShowReset(true)}>Reset All Data</Button>
        ) : (
          <div className="space-y-2 p-4 border border-destructive/30 rounded-xl bg-destructive/5">
            <p className="text-sm font-medium text-destructive">Type "RESET" to confirm</p>
            <Input
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder='Type "RESET"'
              className="border-destructive/30"
            />
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleReset} disabled={resetInput !== "RESET"}>Confirm Reset</Button>
              <Button variant="outline" onClick={() => { setShowReset(false); setResetInput(""); }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
        <p>{entries.length} words stored · Last updated: {lastUpdated}</p>
        <p>VocabBank v1.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;
