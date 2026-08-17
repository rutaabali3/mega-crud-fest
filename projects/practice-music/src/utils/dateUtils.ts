import { format, startOfWeek, endOfWeek, differenceInDays, parseISO, isValid } from 'date-fns';
import type { Session } from './storage';

export function getWeekStart(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function getWeekEnd(date: Date = new Date()): string {
  return format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function formatDate(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'MMM d, yyyy') : iso;
}

export function formatDateShort(iso: string): string {
  const d = parseISO(iso);
  return isValid(d) ? format(d, 'MMM d') : iso;
}

export function getDaysBetween(d1: string, d2: string): number {
  return Math.abs(differenceInDays(parseISO(d1), parseISO(d2)));
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const uniqueDays = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = getToday();
  
  // Check if most recent session is today or yesterday
  if (uniqueDays[0] !== today) {
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (uniqueDays[0] !== yesterday) return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff = getDaysBetween(uniqueDays[i - 1], uniqueDays[i]);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function getThisWeekSessions(sessions: Session[]): Session[] {
  const start = getWeekStart();
  const end = getWeekEnd();
  return sessions.filter(s => s.date >= start && s.date <= end);
}

export function getTodaySessions(sessions: Session[]): Session[] {
  const today = getToday();
  return sessions.filter(s => s.date === today);
}
