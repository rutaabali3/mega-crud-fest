import { useState } from "react";
import { Recipe } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Users, Pencil, Trash2, ShoppingCart } from "lucide-react";

interface Props {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
  onAddToShoppingList: (ingredients: string[]) => void;
}

export function RecipeDetail({ recipe, open, onClose, onEdit, onDelete, onAddToShoppingList }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (!recipe) return null;

  const steps = recipe.instructions.split("\n").filter(s => s.trim());

  const toggleCheck = (i: number) => {
    const next = new Set(checked);
    next.has(i) ? next.delete(i) : next.add(i);
    setChecked(next);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={recipe.photoURL || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </div>
        <div className="p-6 space-y-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="secondary" className="mb-2">{recipe.cuisine}</Badge>
                <DialogTitle className="text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {recipe.title}
                </DialogTitle>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {recipe.prepTime} min</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {recipe.servings} servings</span>
            </div>
          </DialogHeader>

          <div>
            <h4 className="font-semibold mb-2 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Ingredients</h4>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Checkbox
                    checked={checked.has(i)}
                    onCheckedChange={() => toggleCheck(i)}
                  />
                  <span className={checked.has(i) ? "line-through text-muted-foreground" : ""}>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Instructions</h4>
            <ol className="space-y-2 list-decimal list-inside">
              {steps.map((step, i) => (
                <li key={i} className="text-sm leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={() => { onEdit(recipe); onClose(); }}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{recipe.title}". This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onDelete(recipe.id); onClose(); }}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="secondary" size="sm" onClick={() => onAddToShoppingList(recipe.ingredients)}>
              <ShoppingCart className="h-4 w-4 mr-1" /> Add to Shopping List
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
