import { useState, useEffect } from "react";
import { Recipe } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

const CUISINE_SUGGESTIONS = ["Italian", "Thai", "Japanese", "Mexican", "American", "French", "Indian", "Chinese", "Mediterranean", "Korean"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Recipe, "id" | "createdAt">) => void;
  initial?: Recipe | null;
}

export function RecipeForm({ open, onClose, onSave, initial }: Props) {
  const [title, setTitle] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [prepTime, setPrepTime] = useState(30);
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setCuisine(initial.cuisine);
      setPhotoURL(initial.photoURL);
      setPrepTime(initial.prepTime);
      setServings(initial.servings);
      setIngredients(initial.ingredients.length ? initial.ingredients : [""]);
      setInstructions(initial.instructions);
    } else {
      setTitle(""); setCuisine(""); setPhotoURL(""); setPrepTime(30);
      setServings(2); setIngredients([""]); setInstructions("");
    }
  }, [initial, open]);

  const filteredSuggestions = CUISINE_SUGGESTIONS.filter(c =>
    c.toLowerCase().includes(cuisine.toLowerCase()) && c.toLowerCase() !== cuisine.toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title, cuisine, photoURL, prepTime, servings,
      ingredients: ingredients.filter(i => i.trim()),
      instructions,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Recipe name" />
          </div>

          <div className="relative">
            <Label>Cuisine</Label>
            <Input
              value={cuisine}
              onChange={e => { setCuisine(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. Italian"
              required
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-md">
                {filteredSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    onClick={() => { setCuisine(s); setShowSuggestions(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Photo URL</Label>
            <Input value={photoURL} onChange={e => setPhotoURL(e.target.value)} placeholder="https://..." />
            {photoURL && (
              <img
                src={photoURL}
                alt="Preview"
                className="mt-2 rounded-lg h-32 w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prep Time (min)</Label>
              <Input type="number" min={1} value={prepTime} onChange={e => setPrepTime(+e.target.value)} required />
            </div>
            <div>
              <Label>Servings</Label>
              <Input type="number" min={1} value={servings} onChange={e => setServings(+e.target.value)} required />
            </div>
          </div>

          <div>
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={ing}
                    onChange={e => {
                      const copy = [...ingredients];
                      copy[i] = e.target.value;
                      setIngredients(copy);
                    }}
                    placeholder={`Ingredient ${i + 1}`}
                  />
                  {ingredients.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setIngredients([...ingredients, ""])}>
                <Plus className="h-4 w-4 mr-1" /> Add Ingredient
              </Button>
            </div>
          </div>

          <div>
            <Label>Instructions</Label>
            <Textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={6}
              placeholder="Step-by-step instructions (one per line)"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{initial ? "Update" : "Save"} Recipe</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
