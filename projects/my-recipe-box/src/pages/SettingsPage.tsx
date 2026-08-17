import { Recipe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
  recipes: Recipe[];
  onImport: (recipes: Recipe[]) => void;
}

export default function SettingsPage({ dark, onToggleTheme, recipes, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-recipes-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Recipes exported!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
          toast.success(`${data.length} recipe(s) imported!`);
        } else {
          toast.error("Invalid file format");
        }
      } catch {
        toast.error("Could not parse file");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
        Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <Label>Dark Mode</Label>
            </div>
            <Switch checked={dark} onCheckedChange={onToggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You have {recipes.length} recipe(s) saved locally.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Export as JSON
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" /> Import JSON
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
