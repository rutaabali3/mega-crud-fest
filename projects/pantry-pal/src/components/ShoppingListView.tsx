import { ShoppingCart, Plus, Copy, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PantryItem } from "@/hooks/usePantryStore";
import { toast } from "@/hooks/use-toast";

interface Props {
  shoppingList: PantryItem[];
  onAdjustQuantity: (id: string, delta: number) => void;
}

export function ShoppingListView({ shoppingList, onAdjustQuantity }: Props) {
  const exportText = shoppingList
    .map((it) => `☐ ${it.name} (have: ${it.quantity}, need: ${it.lowStockThreshold - it.quantity + 1})`)
    .join("\n");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportText);
    toast({ title: "Copied!", description: "Shopping list copied to clipboard." });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shopping List</h2>
          <p className="text-muted-foreground text-sm">Items running low</p>
        </div>
        {shoppingList.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" /> Copy List
          </Button>
        )}
      </div>

      {shoppingList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">All stocked up!</h3>
            <p className="text-sm text-muted-foreground">No items are running low right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {shoppingList.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-muted-foreground">
                      Have: {item.quantity} · Need: {item.lowStockThreshold}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="gap-1" onClick={() => onAdjustQuantity(item.id, 1)}>
                  <Plus className="h-3 w-3" /> Restock
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
