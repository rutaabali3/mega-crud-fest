import { ShoppingItem } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Download, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  items: ShoppingItem[];
  onToggle: (i: number) => void;
  onRemove: (i: number) => void;
  onClear: () => void;
  exportAsText: () => string;
}

export default function ShoppingListPage({ items, onToggle, onRemove, onClear, exportAsText }: Props) {
  const handleExport = () => {
    const text = exportAsText();
    navigator.clipboard.writeText(text).then(() => toast.success("Shopping list copied to clipboard!"));
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
        Shopping List
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Your shopping list is empty</p>
          <p className="text-sm mt-1">Add ingredients from any recipe!</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { onClear(); toast.success("Shopping list cleared!"); }}>
              <XCircle className="h-4 w-4 mr-1" /> Clear All
            </Button>
          </div>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border group">
                <Checkbox checked={item.checked} onCheckedChange={() => onToggle(i)} />
                <span className={`flex-1 ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(i)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
