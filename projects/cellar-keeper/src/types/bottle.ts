export type BottleType =
  | "Red Wine"
  | "White Wine"
  | "Rosé"
  | "Sparkling"
  | "Whiskey"
  | "Gin"
  | "Rum"
  | "Tequila"
  | "Beer"
  | "Other";

export interface Bottle {
  id: string;
  name: string;
  type: BottleType;
  vintage: number;
  region: string;
  pricePaid: number;
  rating: number;
  locationInCellar: string;
  photoUrl: string;
  quantity: number;
  drinkByDate: string;
  tastingNotes: string;
  dateAdded: string;
  drankOn: string | null;
  isFinished: boolean;
}

export interface CellarSettings {
  theme: "dark" | "light";
  dismissedAlerts: string[];
}

export interface ValueLogEntry {
  date: string;
  totalValue: number;
}

export const BOTTLE_TYPES: BottleType[] = [
  "Red Wine", "White Wine", "Rosé", "Sparkling",
  "Whiskey", "Gin", "Rum", "Tequila", "Beer", "Other",
];

export const TYPE_ICONS: Record<BottleType, string> = {
  "Red Wine": "🍷",
  "White Wine": "🥂",
  "Rosé": "🌸",
  "Sparkling": "🍾",
  "Whiskey": "🥃",
  "Gin": "🫒",
  "Rum": "🏴‍☠️",
  "Tequila": "🌵",
  "Beer": "🍺",
  "Other": "🍸",
};

export const TYPE_COLORS: Record<BottleType, string> = {
  "Red Wine": "from-red-900 to-red-700",
  "White Wine": "from-amber-200 to-yellow-100",
  "Rosé": "from-pink-400 to-rose-300",
  "Sparkling": "from-yellow-300 to-amber-200",
  "Whiskey": "from-amber-800 to-amber-600",
  "Gin": "from-cyan-700 to-teal-500",
  "Rum": "from-amber-900 to-yellow-800",
  "Tequila": "from-lime-600 to-green-500",
  "Beer": "from-yellow-600 to-amber-400",
  "Other": "from-purple-700 to-indigo-500",
};

export function getRatingLabel(rating: number): string {
  if (rating >= 96) return "Classic";
  if (rating >= 90) return "Excellent";
  if (rating >= 80) return "Very Good";
  if (rating >= 70) return "Good";
  return "Below Average";
}

export function getRatingColor(rating: number): string {
  if (rating >= 90) return "bg-cellar-gold text-primary-foreground";
  if (rating >= 80) return "bg-gray-400 text-primary-foreground";
  if (rating >= 70) return "bg-amber-700 text-primary-foreground";
  return "bg-muted text-muted-foreground";
}
