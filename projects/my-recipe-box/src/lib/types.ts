export interface Recipe {
  id: number;
  title: string;
  cuisine: string;
  photoURL: string;
  prepTime: number;
  servings: number;
  ingredients: string[];
  instructions: string;
  createdAt: number;
}

export interface ShoppingItem {
  text: string;
  checked: boolean;
}
