import { useState, useCallback, useEffect } from "react";
import { StreaklyData, Habit, EMPTY_DATA } from "@/types/habit";

const STORAGE_KEY = "streakly-data";

function loadData(): StreaklyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...EMPTY_DATA, habits: [], archivedHabits: [] };
}

function saveData(data: StreaklyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStreaklyData() {
  const [data, setData] = useState<StreaklyData>(loadData);

  useEffect(() => { saveData(data); }, [data]);

  const addHabit = useCallback((habit: Habit) => {
    setData(d => ({ ...d, habits: [...d.habits, habit] }));
  }, []);

  const updateHabit = useCallback((habit: Habit) => {
    setData(d => ({
      ...d,
      habits: d.habits.map(h => h.id === habit.id ? habit : h),
    }));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setData(d => {
      const habit = d.habits.find(h => h.id === id);
      if (!habit) return d;
      return {
        habits: d.habits.filter(h => h.id !== id),
        archivedHabits: [...d.archivedHabits, habit],
      };
    });
  }, []);

  const restoreHabit = useCallback((id: string) => {
    setData(d => {
      const habit = d.archivedHabits.find(h => h.id === id);
      if (!habit) return d;
      return {
        habits: [...d.habits, habit],
        archivedHabits: d.archivedHabits.filter(h => h.id !== id),
      };
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData(d => ({
      ...d,
      archivedHabits: d.archivedHabits.filter(h => h.id !== id),
    }));
  }, []);

  const toggleCompletion = useCallback((id: string, date: string) => {
    setData(d => ({
      ...d,
      habits: d.habits.map(h => {
        if (h.id !== id) return h;
        const has = h.completions.includes(date);
        return {
          ...h,
          completions: has
            ? h.completions.filter(c => c !== date)
            : [...h.completions, date],
        };
      }),
    }));
  }, []);

  const importData = useCallback((imported: StreaklyData) => {
    setData(imported);
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  return {
    data,
    addHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    toggleCompletion,
    importData,
    exportData,
  };
}
