import { useLocalStorage } from "@/hooks/useLocalStorage";
import { DoseLog, DoseStatus } from "@/types";
import { generateId, isOverdue, parseISO, isToday } from "@/utils/dateHelpers";
import { useCallback, useEffect } from "react";

const KEY = "medilog_logs";

export function useLogs() {
  const [logs, setLogs] = useLocalStorage<DoseLog[]>(KEY, []);

  // Auto-missed detection
  useEffect(() => {
    let changed = false;
    const updated = logs.map((log) => {
      if (log.status === "pending" && isOverdue(log.scheduledTime)) {
        changed = true;
        return { ...log, status: "missed" as DoseStatus };
      }
      return log;
    });
    if (changed) setLogs(updated);
  }, []);

  const addLog = useCallback((log: Omit<DoseLog, "id" | "createdAt">) => {
    const newLog: DoseLog = {
      ...log,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, newLog]);
    return newLog;
  }, [setLogs]);

  const updateLog = useCallback((id: string, updates: Partial<DoseLog>) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, [setLogs]);

  const markTaken = useCallback((id: string, notes?: string) => {
    updateLog(id, {
      status: "taken",
      takenAt: new Date().toISOString(),
      notes,
    });
  }, [updateLog]);

  const markSkipped = useCallback((id: string, notes?: string) => {
    updateLog(id, { status: "skipped", notes });
  }, [updateLog]);

  const deleteLogsForMedication = useCallback((medicationId: string) => {
    setLogs((prev) => prev.filter((l) => l.medicationId !== medicationId));
  }, [setLogs]);

  const todayLogs = logs.filter((l) => isToday(parseISO(l.scheduledTime)));

  const getLogsForDate = useCallback((dateStr: string) => {
    return logs.filter((l) => l.scheduledTime.startsWith(dateStr));
  }, [logs]);

  return { logs, setLogs, addLog, updateLog, markTaken, markSkipped, deleteLogsForMedication, todayLogs, getLogsForDate };
}
