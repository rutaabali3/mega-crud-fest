export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  targetStreak: number;
  color: string;
  completions: string[]; // "YYYY-MM-DD"
}

export interface StreaklyData {
  habits: Habit[];
  archivedHabits: Habit[];
}

export const DEFAULT_COLORS = [
  "#58a6ff", "#3fb950", "#d29922", "#f85149",
  "#bc8cff", "#f778ba", "#79c0ff", "#56d364",
  "#e3b341", "#ff7b72", "#d2a8ff", "#ff9bce",
];

export const EMPTY_DATA: StreaklyData = {
  habits: [],
  archivedHabits: [],
};
