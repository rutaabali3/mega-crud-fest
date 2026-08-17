import { Clock, Users } from "lucide-react";
import { Recipe } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onView }: Props) {
  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={() => onView(recipe)}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={recipe.photoURL || "/placeholder.svg"}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-2">
        <Badge variant="secondary" className="text-xs font-medium">
          {recipe.cuisine}
        </Badge>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {recipe.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.prepTime} min</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {recipe.servings}</span>
        </div>
        <Button size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); onView(recipe); }}>
          View Recipe
        </Button>
      </CardContent>
    </Card>
  );
}
