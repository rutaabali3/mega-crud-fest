import { useState } from "react";
import { Search, Plus, Minus, Pencil, Trash2, CheckCircle, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PantryItem, Category } from "@/hooks/usePantryStore";
import { EditItemDialog } from "./EditItemDialog";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  items: PantryItem[];
  onAdjustQuantity: (id: string, delta: number) => void;
  onUpdateItem: (id: string, updates: Partial<Omit<PantryItem, "id">>) => void;
  onDeleteItem: (id: string) => void;
}

type SortKey = "name" | "expiryDate" | "quantity";
const ALL_CATEGORIES: Category[] = ["Food", "Medicine", "Household", "Beauty", "Other"];

function expiryStatus(dateStr: string): "expired" | "soon" | "ok" {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d < today) return "expired";
  if (d.getTime() - today.getTime() <= 7 * 86400000) return "soon";
  return "ok";
}

export function InventoryView({ items, onAdjustQuantity, onUpdateItem, onDeleteItem }: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<PantryItem | null>(null);

  let filtered = items.filter((it) => it.name.toLowerCase().includes(search.toLowerCase()));
  if (catFilter !== "all") filtered = filtered.filter((it) => it.category === catFilter);
  filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "expiryDate") return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    return a.quantity - b.quantity;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Inventory</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ALL_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="expiryDate">Expiry Date</SelectItem>
            <SelectItem value="quantity">Quantity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No items found</h3>
            <p className="text-sm text-muted-foreground">
              {items.length === 0 ? "Add items to see them here." : "Try adjusting your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div className="grid gap-3 sm:grid-cols-2" layout>
          <AnimatePresence>
            {filtered.map((item) => {
              const status = expiryStatus(item.expiryDate);
              const isLow = item.quantity <= item.lowStockThreshold;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">{item.category}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditItem(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Qty: {item.quantity}</span>
                          <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onAdjustQuantity(item.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onAdjustQuantity(item.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {isLow && (
                          <Progress value={(item.quantity / Math.max(item.lowStockThreshold * 2, 1)) * 100} className="h-2" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            status === "expired"
                              ? "text-destructive font-medium"
                              : status === "soon"
                              ? "text-warning font-medium"
                              : "text-success"
                          }
                        >
                          {status === "expired" ? "Expired" : status === "soon" ? "Expiring soon" : "Fresh"} · {item.expiryDate}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => onAdjustQuantity(item.id, -1)}
                        >
                          <CheckCircle className="h-3 w-3" /> Used
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this item from your pantry.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) { onDeleteItem(deleteId); setDeleteId(null); } }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editItem && (
        <EditItemDialog
          item={editItem}
          open={!!editItem}
          onOpenChange={() => setEditItem(null)}
          onSave={(updates) => { onUpdateItem(editItem.id, updates); setEditItem(null); }}
        />
      )}
    </div>
  );
}
