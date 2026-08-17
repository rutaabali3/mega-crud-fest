import { format, parseISO, isToday, isBefore, addHours, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

export {
  format, parseISO, isToday, isBefore, addHours, startOfDay, endOfDay,
  subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay,
};

export function generateId(): string {
  return crypto.randomUUID();
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function toISODateTime(date: Date): string {
  return date.toISOString();
}

export function combineDateAndTime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export function isOverdue(scheduledTime: string, hoursThreshold = 2): boolean {
  const scheduled = parseISO(scheduledTime);
  return isBefore(addHours(scheduled, hoursThreshold), new Date());
}
