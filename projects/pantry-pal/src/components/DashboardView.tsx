import { Package, AlertTriangle, TrendingDown, Grid3X3, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PantryItem } from "@/hooks/usePantryStore";
import { motion } from "framer-motion";

interface Props {
  items: PantryItem[];
  expiredItems: PantryItem[];
  expiringSoonItems: PantryItem[];
  lowStockItems: PantryItem[];
  categories: string[];
  onAddItem: () => void;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function DashboardView({ items, expiredItems, expiringSoonItems, lowStockItems, categories, onAddItem }: Props) {
  const stats = [
    { label: "Total Items", value: items.length, icon: Package, color: "text-primary" },
    { label: "Expiring Soon", value: expiringSoonItems.length, icon: AlertTriangle, color: "text-warning" },
    { label: "Low Stock", value: lowStockItems.length, icon: TrendingDown, color: "text-destructive" },
    { label: "Categories", value: categories.length, icon: Grid3X3, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Your pantry at a glance</p>
        </div>
        <Button onClick={onAddItem} className="gap-2">
          <PlusCircle className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {expiredItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Expired Items!</AlertTitle>
          <AlertDescription>
            {expiredItems.length} item{expiredItems.length > 1 ? "s have" : " has"} expired:{" "}
            {expiredItems.map((i) => i.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {expiringSoonItems.length > 0 && (
        <Alert className="border-warning/50 bg-warning/10 text-warning-foreground [&>svg]:text-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Expiring Soon</AlertTitle>
          <AlertDescription>
            {expiringSoonItems.length} item{expiringSoonItems.length > 1 ? "s expire" : " expires"} within 7 days:{" "}
            {expiringSoonItems.map((i) => i.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                </div>
                <span className="text-3xl font-bold">{s.value}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">Your pantry is empty</h3>
            <p className="text-sm text-muted-foreground">Add your first item to get started tracking your pantry.</p>
            <Button onClick={onAddItem} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
