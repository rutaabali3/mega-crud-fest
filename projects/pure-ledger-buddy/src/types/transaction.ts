import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number(),
  category: z.string(),
  date: z.string(),
  note: z.string(),
});

export const transactionsImportSchema = z.array(transactionSchema);

export type Transaction = z.infer<typeof transactionSchema>;

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
