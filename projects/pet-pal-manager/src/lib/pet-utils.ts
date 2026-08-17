import { differenceInMonths, differenceInYears, format, parseISO, isWithinInterval, addDays, isBefore, isToday } from 'date-fns';
import type { Pet, Species, VetVisit, FeedingSchedule, FeedingLog, Medication } from './types';

export function calculateAge(dob: string): string {
  const birth = parseISO(dob);
  const years = differenceInYears(new Date(), birth);
  const months = differenceInMonths(new Date(), birth) % 12;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? `, ${months} mo` : ''}`;
}

export function calculateHumanAge(dob: string, species: Species): number {
  const totalMonths = differenceInMonths(new Date(), parseISO(dob));
  const years = totalMonths / 12;
  if (species === 'Dog') {
    if (years <= 2) return Math.round(years * 10.5);
    return Math.round(21 + (years - 2) * 4);
  }
  if (species === 'Cat') {
    if (years <= 2) return Math.round(years * 12.5);
    return Math.round(25 + (years - 2) * 4);
  }
  return Math.round(years * 7);
}

export function getLastVetVisit(petId: string, visits: VetVisit[]): string | null {
  const petVisits = visits.filter(v => v.petId === petId).sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  return petVisits[0]?.visitDate ?? null;
}

export function getNextFeeding(petId: string, schedules: FeedingSchedule[], logs: FeedingLog[]): string | null {
  const active = schedules.filter(s => s.petId === petId && s.active);
  if (!active.length) return null;
  const now = format(new Date(), 'HH:mm');
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  for (const sched of active) {
    for (const time of sched.specificTimes.sort()) {
      const alreadyFed = logs.some(l => l.scheduleId === sched.id && l.dateTime.startsWith(todayStr) && format(parseISO(l.dateTime), 'HH:mm') === time);
      if (!alreadyFed && time >= now) return time;
    }
  }
  return null;
}

export function getUpcomingAppointments(visits: VetVisit[]): VetVisit[] {
  const now = new Date();
  const future = addDays(now, 30);
  return visits.filter(v => v.nextAppointmentDate && isWithinInterval(parseISO(v.nextAppointmentDate), { start: now, end: future }))
    .sort((a, b) => a.nextAppointmentDate.localeCompare(b.nextAppointmentDate));
}

export function getMedsDueToday(meds: Medication[]): Medication[] {
  const today = new Date();
  return meds.filter(m => {
    if (m.endDate && isBefore(parseISO(m.endDate), today)) return false;
    const start = parseISO(m.startDate);
    if (isBefore(today, start)) return false;
    return true;
  });
}

export function isMedActive(med: Medication): boolean {
  if (!med.endDate) return true;
  return !isBefore(parseISO(med.endDate), new Date());
}

export function getMedProgress(med: Medication): number {
  if (!med.endDate) return -1;
  const start = parseISO(med.startDate).getTime();
  const end = parseISO(med.endDate).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d, yyyy');
}
