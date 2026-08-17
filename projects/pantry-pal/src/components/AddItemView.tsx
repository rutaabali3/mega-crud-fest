import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, UtensilsCrossed, Pill, Home, Sparkles, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Category } from "@/hooks/usePantryStore";
import { toast } from "@/hooks/use-toast";

const CATEGORIES: { value: Category; label: string; icon: typeof UtensilsCrossed }[] = [
  { value: "Food", label: "Food", icon: UtensilsCrossed },
  { value: "Medicine", label: "Medicine", icon: Pill },
  { value: "Household", label: "Household", icon: Home },
  { value: "Beauty", label: "Beauty", icon: Sparkles },
  { value: "Other", label: "Other", icon: HelpCircle },
];

interface Props {
  onAdd: (item: { name: string; quantity: number; expiryDate: string; category: Category; lowStockThreshold: number }) => void;
}

export function AddItemView({ onAdd }: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState<Date>();
  const [threshold, setThreshold] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      toast({ title: "Missing fields", description: "Please fill in name and expiry date.", variant: "destructive" });
      return;
    }
    onAdd({ name: name.trim(), quantity, expiryDate: format(date, "yyyy-MM-dd"), category, lowStockThreshold: threshold });
    toast({ title: "Item added!", description: `${name} has been added to your pantry.` });
    setName(""); setQuantity(1); setDate(undefined); setCategory("Food"); setThreshold(2);
  };

  const catInfo = CATEGORIES.find((c) => c.value === category)!;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Item</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Pantry Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" placeholder="e.g. Milk, Aspirin…" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" min={0} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thresh">Low Stock Threshold</Label>
                <Input id="thresh" type="number" min={0} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <catInfo.icon className="h-4 w-4" />
                      {catInfo.label}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <c.icon className="h-4 w-4" /> {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" className="w-full">Add to Pantry</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
