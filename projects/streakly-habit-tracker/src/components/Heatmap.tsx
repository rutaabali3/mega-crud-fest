import { useMemo, useState } from "react";
import { Habit } from "@/types/habit";
import { Calendar } from "@/components/ui/calendar";

interface HeatmapProps {
  habit: Habit;
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function Heatmap({ habit }: HeatmapProps) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => fmtDate(today), [today]);

  const completionSet = useMemo(() => new Set(habit.completions), [habit.completions]);

  const completedThisYear = useMemo(() => {
    const year = today.getFullYear();
    return habit.completions.filter((dateStr) => dateStr.startsWith(`${year}-`)).length;
  }, [habit.completions, today]);

  const completedThisMonth = useMemo(() => {
    const monthPrefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return habit.completions.filter((dateStr) => dateStr.startsWith(monthPrefix)).length;
  }, [habit.completions, month]);

  const [h, s] = useMemo(() => {
    const [hue, sat] = hexToHsl(habit.color);
    return [hue, sat];
  }, [habit.color]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-card-foreground">{completedThisMonth}</span> completed this month
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-card-foreground">{completedThisYear}</span> days completed this year
        </p>
      </div>

      <div className="rounded-xl border bg-card p-2 sm:p-4">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          className="w-full p-0"
          modifiers={{
            completed: (date) => completionSet.has(fmtDate(date)),
            missed: (date) => {
              const sameMonth =
                date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
              return sameMonth && date <= today && !completionSet.has(fmtDate(date));
            },
            today: (date) => fmtDate(date) === todayStr,
            future: (date) => date > today,
          }}
          modifiersStyles={{
            completed: {
              backgroundColor: `hsl(${h} ${Math.max(s, 52)}% 40%)`,
              color: "hsl(var(--primary-foreground))",
              fontWeight: 700,
            },
            missed: {
              backgroundColor: "hsl(var(--muted))",
              color: "hsl(var(--muted-foreground))",
            },
            today: {
              outline: "2px solid hsl(var(--primary))",
              outlineOffset: "-2px",
            },
            future: {
              opacity: 0.5,
            },
          }}
          classNames={{
            months: "w-full",
            month: "w-full space-y-4",
            caption: "flex justify-center pt-2 relative items-center",
            caption_label: "text-base font-semibold text-card-foreground",
            nav: "space-x-1 flex items-center",
            table: "w-full border-separate border-spacing-1",
            head_row: "grid grid-cols-7",
            head_cell:
              "text-muted-foreground h-10 w-full text-center text-xs font-medium flex items-center justify-center",
            row: "grid grid-cols-7",
            cell: "h-12 w-full p-0 text-center align-middle",
            day: "h-12 w-full rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground/50 opacity-60",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
        />
      </div>

      <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
        <span>Missed</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <span>Completed</span>
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: `hsl(${h} ${Math.max(s, 52)}% 40%)` }}
        />
      </div>
    </div>
  );
}
