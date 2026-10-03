import { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import { AppLayout, Tab } from "@/components/AppLayout";
import { DashboardView } from "@/components/DashboardView";
import { InventoryView } from "@/components/InventoryView";
import { AddItemView } from "@/components/AddItemView";
import { ShoppingListView } from "@/components/ShoppingListView";
import { usePantryStore } from "@/hooks/usePantryStore";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const store = usePantryStore();
  const hasShownToastRef = useRef(false);

  const { expiredItems, expiringSoonItems, lowStockItems } = store;
  const expiredCount = expiredItems.length;
  const expiringSoonCount = expiringSoonItems.length;
  const lowStockCount = lowStockItems.length;

  // On-load warnings
  useEffect(() => {
    if (hasShownToastRef.current) return;
    hasShownToastRef.current = true;

    const warnings: string[] = [];
    if (expiredCount > 0) warnings.push(`${expiredCount} expired`);
    if (expiringSoonCount > 0) warnings.push(`${expiringSoonCount} expiring soon`);
    if (lowStockCount > 0) warnings.push(`${lowStockCount} low stock`);
    if (warnings.length > 0) {
      toast({ title: "Pantry Alert", description: warnings.join(" · ") });
    }
  }, [expiredCount, expiringSoonCount, lowStockCount]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppLayout activeTab={activeTab} onTabChange={setActiveTab} onClearAll={() => {
        store.clearAll();
        toast({ title: "All cleared", description: "All pantry data has been removed." });
      }}>
        {activeTab === "dashboard" && (
          <DashboardView
            items={store.items}
            expiredItems={store.expiredItems}
            expiringSoonItems={store.expiringSoonItems}
            lowStockItems={store.lowStockItems}
            categories={store.categories}
            onAddItem={() => setActiveTab("add")}
          />
        )}
        {activeTab === "inventory" && (
          <InventoryView
            items={store.items}
            onAdjustQuantity={(id, d) => {
              store.adjustQuantity(id, d);
              if (d < 0) toast({ title: "Quantity updated", description: "Item quantity decreased." });
            }}
            onUpdateItem={(id, updates) => {
              store.updateItem(id, updates);
              toast({ title: "Item updated", description: "Changes saved." });
            }}
            onDeleteItem={(id) => {
              store.deleteItem(id);
              toast({ title: "Item deleted", description: "Item removed from pantry." });
            }}
          />
        )}
        {activeTab === "add" && (
          <AddItemView onAdd={(item) => { store.addItem(item); }} />
        )}
        {activeTab === "shopping" && (
          <ShoppingListView shoppingList={store.shoppingList} onAdjustQuantity={(id, d) => {
            store.adjustQuantity(id, d);
            toast({ title: "Restocked!", description: "Quantity increased." });
          }} />
        )}
      </AppLayout>
    </ThemeProvider>
  );
};

export default Index;
