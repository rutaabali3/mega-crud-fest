const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function isBeforeToday(iso: string): boolean {
  return iso < todayISO();
}

export function daysOverdue(iso: string): number {
  return Math.max(0, daysBetween(iso, todayISO()));
}

export function getWeekGroup(iso: string): "This Week" | "Next Week" | "Later This Month" {
  const today = new Date();
  const target = new Date(iso);
  const diff = daysBetween(todayISO(), iso);
  if (diff <= (7 - today.getDay())) return "This Week";
  if (diff <= (14 - today.getDay())) return "Next Week";
  return "Later This Month";
}

export function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function isThisYear(iso: string): boolean {
  return new Date(iso).getFullYear() === new Date().getFullYear();
}

export function getMonthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
