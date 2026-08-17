import { Recipe } from "./types";

export const sampleRecipes: Recipe[] = [
  {
    id: 1,
    title: "Classic Margherita Pizza",
    cuisine: "Italian",
    photoURL: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=400&fit=crop",
    prepTime: 45,
    servings: 4,
    ingredients: [
      "2 1/2 cups all-purpose flour",
      "1 tsp active dry yeast",
      "1 tsp sugar",
      "3/4 cup warm water",
      "2 tbsp olive oil",
      "1 cup San Marzano tomato sauce",
      "8 oz fresh mozzarella",
      "Fresh basil leaves",
      "Salt to taste"
    ],
    instructions: "Mix yeast, sugar, and warm water. Let sit 10 minutes.\nCombine flour and salt, add yeast mixture and olive oil.\nKnead dough 8-10 minutes until smooth.\nLet rise 1 hour in a warm place.\nPreheat oven to 475°F (245°C).\nStretch dough on floured surface.\nSpread tomato sauce, add torn mozzarella.\nBake 12-15 minutes until crust is golden.\nTop with fresh basil and drizzle olive oil.",
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 2,
    title: "Chicken Pad Thai",
    cuisine: "Thai",
    photoURL: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop",
    prepTime: 30,
    servings: 2,
    ingredients: [
      "8 oz rice noodles",
      "2 chicken breasts, sliced",
      "2 eggs",
      "1 cup bean sprouts",
      "3 tbsp fish sauce",
      "2 tbsp tamarind paste",
      "1 tbsp brown sugar",
      "2 cloves garlic, minced",
      "Crushed peanuts",
      "Lime wedges",
      "Green onions"
    ],
    instructions: "Soak rice noodles in warm water 20 minutes, drain.\nMix fish sauce, tamarind paste, and brown sugar for sauce.\nStir-fry chicken in hot oil until cooked through.\nPush chicken aside, scramble eggs in the pan.\nAdd noodles and sauce, toss everything together.\nAdd bean sprouts and green onions.\nServe topped with crushed peanuts and lime.",
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 3,
    title: "Avocado Toast with Poached Egg",
    cuisine: "American",
    photoURL: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop",
    prepTime: 10,
    servings: 1,
    ingredients: [
      "2 slices sourdough bread",
      "1 ripe avocado",
      "2 eggs",
      "1 tbsp white vinegar",
      "Red pepper flakes",
      "Salt and pepper",
      "Lemon juice",
      "Everything bagel seasoning"
    ],
    instructions: "Toast sourdough slices until golden.\nMash avocado with lemon juice, salt, and pepper.\nBring water to a gentle simmer, add vinegar.\nCreate a whirlpool and crack eggs in.\nPoach 3-4 minutes for runny yolk.\nSpread mashed avocado on toast.\nTop with poached eggs.\nSprinkle red pepper flakes and everything seasoning.",
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 4,
    title: "Japanese Miso Ramen",
    cuisine: "Japanese",
    photoURL: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
    prepTime: 60,
    servings: 2,
    ingredients: [
      "2 packs fresh ramen noodles",
      "4 cups chicken broth",
      "3 tbsp white miso paste",
      "1 tbsp soy sauce",
      "1 tbsp sesame oil",
      "2 soft-boiled eggs",
      "Sliced chashu pork",
      "Corn kernels",
      "Nori sheets",
      "Green onions",
      "Sesame seeds"
    ],
    instructions: "Soft-boil eggs (6.5 minutes), peel and marinate in soy sauce.\nHeat sesame oil, sauté garlic and ginger.\nAdd chicken broth and bring to a simmer.\nDissolve miso paste in a ladle of hot broth, add back.\nAdd soy sauce, adjust seasoning.\nCook ramen noodles according to package.\nDivide noodles into bowls, ladle broth over.\nTop with egg halves, chashu, corn, nori, and green onions.",
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 5,
    title: "Chocolate Lava Cake",
    cuisine: "French",
    photoURL: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
    prepTime: 25,
    servings: 4,
    ingredients: [
      "4 oz dark chocolate (70%)",
      "1/2 cup unsalted butter",
      "1 cup powdered sugar",
      "2 whole eggs",
      "2 egg yolks",
      "6 tbsp all-purpose flour",
      "Butter and cocoa for ramekins",
      "Vanilla ice cream for serving"
    ],
    instructions: "Preheat oven to 425°F (220°C).\nMelt chocolate and butter together, stir smooth.\nWhisk in powdered sugar.\nAdd eggs and yolks, mix well.\nFold in flour until just combined.\nGrease ramekins with butter and dust with cocoa.\nDivide batter among ramekins.\nBake 12-14 minutes (edges firm, center soft).\nLet cool 1 minute, invert onto plates.\nServe immediately with vanilla ice cream.",
    createdAt: Date.now() - 86400000
  }
];
