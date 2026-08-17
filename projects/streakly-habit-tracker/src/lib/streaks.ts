import { Habit } from "@/types/habit";

function toDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTodayStr(): string {
  return formatDate(new Date());
}

export function getCurrentStreak(habit: Habit): number {
  const sorted = [...habit.completions].sort().reverse();
  if (sorted.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  // Streak must include today or yesterday
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

  if (habit.frequency === "weekly") {
    // For weekly, count consecutive weeks
    let streak = 1;
    let current = toDate(sorted[0]);
    for (let i = 1; i < sorted.length; i++) {
      const prev = toDate(sorted[i]);
      const diff = Math.floor((current.getTime() - prev.getTime()) / 86400000);
      if (diff <= 7) {
        streak++;
        current = prev;
      } else break;
    }
    return streak;
  }

  // Daily
  let streak = 1;
  let current = toDate(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const prev = toDate(sorted[i]);
    const diff = Math.floor((current.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      current = prev;
    } else break;
  }
  return streak;
}

export function getLongestStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;
  const sorted = [...habit.completions].sort();
  const gap = habit.frequency === "weekly" ? 7 : 1;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.floor(
      (toDate(sorted[i]).getTime() - toDate(sorted[i - 1]).getTime()) / 86400000
    );
    if (diff <= gap) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getCompletionsForYear(habit: Habit): number {
  const year = new Date().getFullYear();
  return habit.completions.filter(c => c.startsWith(String(year))).length;
}

export function isCompletedToday(habit: Habit): boolean {
  return habit.completions.includes(getTodayStr());
}

export { formatDate };
