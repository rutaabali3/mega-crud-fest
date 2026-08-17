import { useMemo, useState } from "react";
import { Asset } from "@/types/asset";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PalettePreviewProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast({ title: "Exported!", description: `${filename} downloaded.` });
}

export function PalettePreview({ open, onClose, assets }: PalettePreviewProps) {
  const colorAssets = assets.filter(a => a.type === "color");
  const projects = useMemo(() => [...new Set(colorAssets.map(a => a.project))], [colorAssets]);
  const [filterProject, setFilterProject] = useState("");

  const filtered = filterProject ? colorAssets.filter(a => a.project === filterProject) : colorAssets;
  const grouped = useMemo(() => {
    const map = new Map<string, Asset[]>();
    filtered.forEach(a => { const arr = map.get(a.project) || []; arr.push(a); map.set(a.project, arr); });
    return Array.from(map.entries());
  }, [filtered]);

  const exportCSS = () => {
    let css = ":root {\n";
    grouped.forEach(([proj, assets]) => {
      css += `  /* Project: ${proj} */\n`;
      assets.forEach(a => {
        a.hexValues.forEach((hex, i) => {
          css += `  --color-${slugify(a.name)}-${i}: ${hex};\n`;
        });
      });
    });
    css += "}\n";
    downloadFile(css, "colors.css", "text/css");
  };

  const exportTailwind = () => {
    const colors: Record<string, Record<string, string>> = {};
    grouped.forEach(([proj, assets]) => {
      assets.forEach(a => {
        const key = `${slugify(proj)}-${slugify(a.name)}`;
        const obj: Record<string, string> = {};
        a.hexValues.forEach((hex, i) => {
          obj[i === 0 ? "DEFAULT" : String(i)] = hex;
        });
        colors[key] = obj;
      });
    });
    const config = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colors, null, 8).replace(/^/gm, "      ").trim()}\n    }\n  }\n}\n`;
    downloadFile(config, "tailwind.colors.js", "text/javascript");
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Color Palette Preview</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 mt-2">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSS}>
              <Download className="h-4 w-4 mr-1" /> CSS Variables
            </Button>
            <Button variant="outline" size="sm" onClick={exportTailwind}>
              <Download className="h-4 w-4 mr-1" /> Tailwind Config
            </Button>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {grouped.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No color assets found.</p>
          )}
          {grouped.map(([proj, assets]) => (
            <div key={proj}>
              <h3 className="text-sm font-semibold mb-2">{proj}</h3>
              <div className="space-y-3">
                {assets.map(a => (
                  <div key={a.id}>
                    <p className="text-xs text-muted-foreground mb-1">{a.name}</p>
                    <div className="flex rounded-lg overflow-hidden h-12">
                      {a.hexValues.map((hex, i) => (
                        <button
                          key={i}
                          className="flex-1 relative group"
                          style={{ backgroundColor: hex }}
                          onClick={() => { navigator.clipboard.writeText(hex); toast({ title: "Copied!", description: hex }); }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <Copy className="h-3.5 w-3.5 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex">
                      {a.hexValues.map((hex, i) => (
                        <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground mt-1 font-mono">{hex}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
