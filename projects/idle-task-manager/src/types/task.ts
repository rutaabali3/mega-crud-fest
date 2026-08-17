export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "low" | "medium" | "high";
  category: string;
  completed: boolean;
  createdAt: string;
  order: number;
}

export type FilterType = "all" | "today" | "upcoming" | "completed";

export const CATEGORY_SUGGESTIONS = [
  "Work",
  "Personal",
  "Shopping",
  "Health",
  "Learning",
  "Errands",
  "Other",
];
