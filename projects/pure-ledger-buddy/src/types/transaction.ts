export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
}

export const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Salary",
  "Freelance",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Rent",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Other"];
