import { useState, useEffect } from "react";
import { Asset, AssetType } from "@/types/asset";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";

interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Asset, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate?: (id: string, data: Partial<Asset>) => void;
  editingAsset?: Asset | null;
  existingProjects: string[];
}

const WEIGHTS = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
const TYPES: AssetType[] = ["color", "font", "icon", "image"];

export function AssetModal({ open, onClose, onSave, onUpdate, editingAsset, existingProjects }: AssetModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("color");
  const [project, setProject] = useState("");
  const [newProject, setNewProject] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [hexValues, setHexValues] = useState<string[]>(["#000000"]);
  const [fontFamily, setFontFamily] = useState("");
  const [fontWeights, setFontWeights] = useState<string[]>([]);
  const [iconSvg, setIconSvg] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAsset) {
      setName(editingAsset.name);
      setType(editingAsset.type);
      setProject(editingAsset.project);
      setTags([...editingAsset.tags]);
      setHexValues(editingAsset.hexValues.length ? [...editingAsset.hexValues] : ["#000000"]);
      setFontFamily(editingAsset.fontFamily);
      setFontWeights([...editingAsset.fontWeights]);
      setIconSvg(editingAsset.iconSvg);
      setImageUrl(editingAsset.imageUrl);
      setShowNewProject(false);
      setNewProject("");
    } else {
      setName(""); setType("color"); setProject(existingProjects[0] || "");
      setTags([]); setTagInput(""); setHexValues(["#000000"]);
      setFontFamily(""); setFontWeights([]); setIconSvg(""); setImageUrl("");
      setShowNewProject(false); setNewProject("");
    }
    setErrors({});
  }, [editingAsset, open, existingProjects]);

  const addTag = (val: string) => {
    const t = val.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    const proj = showNewProject ? newProject.trim() : project;
    if (!proj) e.project = "Project is required";
    if (type === "color" && hexValues.every(h => !h)) e.hex = "At least one color required";
    if (type === "font" && !fontFamily.trim()) e.fontFamily = "Font family is required";
    if (type === "icon" && !iconSvg.trim()) e.iconSvg = "SVG code is required";
    if (type === "image" && !imageUrl.trim()) e.imageUrl = "Image URL is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const proj = showNewProject ? newProject.trim() : project;
    const data = {
      name: name.trim(), type, project: proj, tags,
      hexValues: type === "color" ? hexValues.filter(Boolean) : [],
      fontFamily: type === "font" ? fontFamily.trim() : "",
      fontWeights: type === "font" ? fontWeights : [],
      iconSvg: type === "icon" ? iconSvg : "",
      imageUrl: type === "image" ? imageUrl.trim() : "",
    };
    if (editingAsset && onUpdate) {
      onUpdate(editingAsset.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Asset name" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Type selector */}
          <div>
            <Label>Type</Label>
            <div className="flex gap-1 mt-1">
              {TYPES.map(t => (
                <Button
                  key={t} type="button" size="sm"
                  variant={type === t ? "default" : "outline"}
                  onClick={() => setType(t)}
                  className="capitalize flex-1"
                >{t}</Button>
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <Label>Project</Label>
            {!showNewProject ? (
              <div className="flex gap-2 mt-1">
                <select
                  value={project}
                  onChange={e => setProject(e.target.value)}
                  className="flex-1 h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select project...</option>
                  {existingProjects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewProject(true)}>New</Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Input value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="New project name" />
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewProject(false)}>Cancel</Button>
              </div>
            )}
            {errors.project && <p className="text-xs text-destructive mt-1">{errors.project}</p>}
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1 mt-1 mb-1">
              {tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  {t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
              }}
              placeholder="Type and press Enter"
            />
          </div>

          {/* Type-specific fields */}
          {type === "color" && (
            <div>
              <Label>Colors</Label>
              <div className="space-y-2 mt-1">
                {hexValues.map((hex, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="color" value={hex}
                      onChange={e => { const v = [...hexValues]; v[i] = e.target.value; setHexValues(v); }}
                      className="w-10 h-9 rounded border cursor-pointer"
                    />
                    <Input
                      value={hex}
                      onChange={e => { const v = [...hexValues]; v[i] = e.target.value; setHexValues(v); }}
                      className="flex-1 font-mono text-sm"
                    />
                    {hexValues.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setHexValues(hexValues.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {hexValues.length < 10 && (
                  <Button variant="outline" size="sm" onClick={() => setHexValues([...hexValues, "#000000"])}>
                    <Plus className="h-4 w-4 mr-1" /> Add Color
                  </Button>
                )}
              </div>
              <div className="flex h-8 rounded-lg overflow-hidden mt-2">
                {hexValues.map((hex, i) => <div key={i} className="flex-1" style={{ backgroundColor: hex }} />)}
              </div>
              {errors.hex && <p className="text-xs text-destructive mt-1">{errors.hex}</p>}
            </div>
          )}

          {type === "font" && (
            <div className="space-y-3">
              <div>
                <Label>Font Family</Label>
                <Input value={fontFamily} onChange={e => setFontFamily(e.target.value)} placeholder="e.g. Roboto" />
                {errors.fontFamily && <p className="text-xs text-destructive mt-1">{errors.fontFamily}</p>}
              </div>
              <div>
                <Label>Weights</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {WEIGHTS.map(w => (
                    <label key={w} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={fontWeights.includes(w)}
                        onCheckedChange={checked => {
                          setFontWeights(checked ? [...fontWeights, w] : fontWeights.filter(x => x !== w));
                        }}
                      />
                      {w}
                    </label>
                  ))}
                </div>
              </div>
              {fontFamily && (
                <div className="p-3 rounded-lg bg-muted">
                  <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${fontWeights.join(";") || "400"}&display=swap`} />
                  <p style={{ fontFamily }} className="text-lg">The quick brown fox jumps over the lazy dog</p>
                </div>
              )}
            </div>
          )}

          {type === "icon" && (
            <div className="space-y-2">
              <Label>SVG Code</Label>
              <Textarea value={iconSvg} onChange={e => setIconSvg(e.target.value)} placeholder="<svg>...</svg>" rows={5} className="font-mono text-xs" />
              {iconSvg && (
                <div className="p-4 rounded-lg bg-muted flex items-center justify-center [&_svg]:w-16 [&_svg]:h-16" dangerouslySetInnerHTML={{ __html: iconSvg }} />
              )}
              {errors.iconSvg && <p className="text-xs text-destructive mt-1">{errors.iconSvg}</p>}
            </div>
          )}

          {type === "image" && (
            <div className="space-y-2">
              <Label>Upload Image (max 20 MB)</Label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 20 * 1024 * 1024) {
                    setErrors(prev => ({ ...prev, imageUrl: "File must be under 20 MB" }));
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => setImageUrl(reader.result as string);
                  reader.readAsDataURL(file);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium cursor-pointer"
              />
              {imageUrl && (
                <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
              )}
              {errors.imageUrl && <p className="text-xs text-destructive mt-1">{errors.imageUrl}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{editingAsset ? "Update Asset" : "Save Asset"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
