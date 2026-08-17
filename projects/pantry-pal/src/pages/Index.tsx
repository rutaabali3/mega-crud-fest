import { useState, useEffect } from "react";
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

  // On-load warnings
  useEffect(() => {
    const warnings: string[] = [];
    if (store.expiredItems.length > 0) warnings.push(`${store.expiredItems.length} expired`);
    if (store.expiringSoonItems.length > 0) warnings.push(`${store.expiringSoonItems.length} expiring soon`);
    if (store.lowStockItems.length > 0) warnings.push(`${store.lowStockItems.length} low stock`);
    if (warnings.length > 0) {
      toast({ title: "Pantry Alert", description: warnings.join(" · ") });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
