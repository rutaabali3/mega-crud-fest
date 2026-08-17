export type Currency = "USD" | "EUR" | "GBP" | "PKR";
export type Priority = "low" | "medium" | "high";
export type Occasion =
  | "Birthday"
  | "Christmas"
  | "Anniversary"
  | "Wedding"
  | "Graduation"
  | "Baby Shower"
  | "Just Because"
  | "Other";

export interface WishItem {
  id: string;
  name: string;
  url?: string;
  price: number;
  currency: Currency;
  priority: Priority;
  forPerson: string;
  occasion: Occasion;
  notes?: string;
  imageUrl?: string;
  claimed: boolean;
  claimedBy?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = "grid" | "list";
export type SortOption = "newest" | "price-asc" | "price-desc" | "priority" | "person-az";
export type StatusFilter = "all" | "unclaimed" | "claimed" | "purchased";

export const OCCASIONS: { label: Occasion; emoji: string }[] = [
  { label: "Birthday", emoji: "🎂" },
  { label: "Christmas", emoji: "🎄" },
  { label: "Anniversary", emoji: "💍" },
  { label: "Wedding", emoji: "💒" },
  { label: "Graduation", emoji: "🎓" },
  { label: "Baby Shower", emoji: "👶" },
  { label: "Just Because", emoji: "💝" },
  { label: "Other", emoji: "🎁" },
];

export const CURRENCIES: { value: Currency; symbol: string }[] = [
  { value: "USD", symbol: "$" },
  { value: "EUR", symbol: "€" },
  { value: "GBP", symbol: "£" },
  { value: "PKR", symbol: "₨" },
];

export const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; dot: string }> = {
  low: { color: "text-green-500", label: "Low", dot: "🟢" },
  medium: { color: "text-yellow-500", label: "Medium", dot: "🟡" },
  high: { color: "text-red-500", label: "High", dot: "🔴" },
};
