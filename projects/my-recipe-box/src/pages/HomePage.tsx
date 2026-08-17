import { useState, useMemo } from "react";
import { Recipe } from "@/lib/types";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeDetail } from "@/components/RecipeDetail";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface Props {
  recipes: Recipe[];
  onAdd: (data: Omit<Recipe, "id" | "createdAt">) => void;
  onUpdate: (id: number, data: Partial<Recipe>) => void;
  onDelete: (id: number) => void;
  onAddToShoppingList: (ingredients: string[]) => number;
}

const TIME_FILTERS = [
  { label: "All Times", value: "all" },
  { label: "Under 15 min", value: "15" },
  { label: "15–30 min", value: "30" },
  { label: "30–60 min", value: "60" },
  { label: "60+ min", value: "60+" },
];

export default function HomePage({ recipes, onAdd, onUpdate, onDelete, onAddToShoppingList }: Props) {
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);

  const cuisines = useMemo(() => {
    const set = new Set(recipes.map(r => r.cuisine));
    return Array.from(set).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.ingredients.some(i => i.toLowerCase().includes(q));
      const matchCuisine = cuisineFilter === "all" || r.cuisine === cuisineFilter;
      let matchTime = true;
      if (timeFilter === "15") matchTime = r.prepTime < 15;
      else if (timeFilter === "30") matchTime = r.prepTime >= 15 && r.prepTime <= 30;
      else if (timeFilter === "60") matchTime = r.prepTime > 30 && r.prepTime <= 60;
      else if (timeFilter === "60+") matchTime = r.prepTime > 60;
      return matchSearch && matchCuisine && matchTime;
    });
  }, [recipes, search, cuisineFilter, timeFilter]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
        My Recipes
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes or ingredients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            {cuisines.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            {TIME_FILTERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No recipes found</p>
          <p className="text-sm mt-1">Try a different search or add a new recipe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(r => (
            <RecipeCard key={r.id} recipe={r} onView={setViewRecipe} />
          ))}
        </div>
      )}

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-40"
        size="icon"
        onClick={() => { setEditRecipe(null); setFormOpen(true); }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Form modal */}
      <RecipeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editRecipe}
        onSave={(data) => {
          if (editRecipe) {
            onUpdate(editRecipe.id, data);
            toast.success("Recipe updated!");
          } else {
            onAdd(data);
            toast.success("Recipe added!");
          }
        }}
      />

      {/* Detail modal */}
      <RecipeDetail
        recipe={viewRecipe}
        open={!!viewRecipe}
        onClose={() => setViewRecipe(null)}
        onEdit={(r) => { setEditRecipe(r); setFormOpen(true); }}
        onDelete={(id) => { onDelete(id); toast.success("Recipe deleted!"); }}
        onAddToShoppingList={(ings) => {
          const count = onAddToShoppingList(ings);
          toast.success(`${count} ingredient(s) added to shopping list!`);
        }}
      />
    </div>
  );
}
