export type Category = "Social" | "Finance" | "Work" | "Shopping" | "Email" | "Gaming" | "Other";

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "Social", label: "Social", emoji: "💬" },
  { value: "Finance", label: "Finance", emoji: "💰" },
  { value: "Work", label: "Work", emoji: "💼" },
  { value: "Shopping", label: "Shopping", emoji: "🛒" },
  { value: "Email", label: "Email", emoji: "📧" },
  { value: "Gaming", label: "Gaming", emoji: "🎮" },
  { value: "Other", label: "Other", emoji: "📁" },
];

export interface EncryptedField {
  ciphertext: string;
  iv: string;
}

export interface PasswordHistoryItem {
  password: EncryptedField;
  changedAt: string;
}

export interface VaultEntry {
  id: string;
  siteName: string;
  siteUrl: string;
  username: string;
  password: EncryptedField;
  notes: EncryptedField | null;
  category: Category;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  passwordHistory: PasswordHistoryItem[];
}

export type SortOption = "newest" | "oldest" | "az" | "updated";
export type FilterCategory = "all" | "favorites" | Category;
