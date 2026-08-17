import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Medication } from "@/types";
import { generateId } from "@/utils/dateHelpers";
import { useCallback } from "react";

const KEY = "medilog_medications";

export function useMedications() {
  const [medications, setMedications] = useLocalStorage<Medication[]>(KEY, []);

  const addMedication = useCallback((med: Omit<Medication, "id" | "createdAt">) => {
    const newMed: Medication = {
      ...med,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setMedications((prev) => [...prev, newMed]);
    return newMed;
  }, [setMedications]);

  const updateMedication = useCallback((id: string, updates: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, [setMedications]);

  const deleteMedication = useCallback((id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, [setMedications]);

  const activeMedications = medications.filter((m) => m.isActive);

  return { medications, setMedications, addMedication, updateMedication, deleteMedication, activeMedications };
}
