import { useMemo } from "react";
import { Medication, DoseLog } from "@/types";
import { isToday, parseISO, isBefore, addDays } from "@/utils/dateHelpers";

export function useNotifications(medications: Medication[], logs: DoseLog[]) {
  const pendingToday = useMemo(() => {
    return logs.filter(
      (l) => isToday(parseISO(l.scheduledTime)) && l.status === "pending"
    ).length;
  }, [logs]);

  const refillAlerts = useMemo(() => {
    const now = new Date();
    return medications.filter((m) => {
      if (!m.isActive || !m.endDate) return false;
      const end = parseISO(m.endDate);
      const reminderDate = addDays(now, 0);
      const alertStart = new Date(end.getTime() - m.refillReminderDays * 86400000);
      return isBefore(alertStart, now) && isBefore(now, end);
    });
  }, [medications]);

  const badgeCount = pendingToday + refillAlerts.length;

  return { pendingToday, refillAlerts, badgeCount };
}
