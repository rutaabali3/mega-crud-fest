import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useRecipes } from "@/hooks/use-recipes";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { useThemeToggle } from "@/hooks/use-theme";
import HomePage from "@/pages/HomePage";
import AddRecipePage from "@/pages/AddRecipePage";
import ShoppingListPage from "@/pages/ShoppingListPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const App = () => {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, importRecipes } = useRecipes();
  const { items, addItems, toggleItem, removeItem, clearAll, exportAsText } = useShoppingList();
  const { dark, toggle } = useThemeToggle();

  return (
    <TooltipProvider>
      <Sonner />
      <BrowserRouter basename="/my-recipe-box">
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-12 flex items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
                <SidebarTrigger className="ml-2" />
                <span className="ml-2 text-sm font-medium text-muted-foreground">🍳 My Recipe Book</span>
              </header>
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={
                    <HomePage
                      recipes={recipes}
                      onAdd={addRecipe}
                      onUpdate={updateRecipe}
                      onDelete={deleteRecipe}
                      onAddToShoppingList={addItems}
                    />
                  } />
                  <Route path="/add" element={<AddRecipePage onAdd={addRecipe} />} />
                  <Route path="/shopping" element={
                    <ShoppingListPage
                      items={items}
                      onToggle={toggleItem}
                      onRemove={removeItem}
                      onClear={clearAll}
                      exportAsText={exportAsText}
                    />
                  } />
                  <Route path="/settings" element={
                    <SettingsPage
                      dark={dark}
                      onToggleTheme={toggle}
                      recipes={recipes}
                      onImport={importRecipes}
                    />
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
