export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  cost: number;
  type: "food" | "transport" | "activity" | "hotel" | "other";
}

export interface DayPlan {
  date: string;
  activities: Activity[];
}

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  packed: boolean;
  essential: boolean;
}

export interface PackingCategory {
  id: string;
  name: string;
  color: string;
  items: PackingItem[];
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: "food" | "transport" | "accommodation" | "activity" | "other";
}

export interface Trip {
  id: string;
  destination: string;
  coverEmoji: string;
  startDate: string;
  endDate: string;
  accommodation: {
    name: string;
    address: string;
    confirmationNo: string;
  };
  budget: {
    total: number;
    currency: string;
    spent: number;
  };
  itinerary: DayPlan[];
  packingCategories: PackingCategory[];
  expenses: Expense[];
  notes: string;
  createdAt: string;
}

export type Page = "trips" | "detail" | "tools";
export type DetailTab = "overview" | "itinerary" | "packing" | "notes";
