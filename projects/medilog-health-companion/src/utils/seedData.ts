import { Medication, DoseLog, SymptomEntry } from "@/types";
import { generateId, toISODate, subDays, addDays } from "@/utils/dateHelpers";

const now = new Date();
const today = toISODate(now);

export function generateSeedMedications(): Medication[] {
  return [
    {
      id: generateId(),
      name: "Metformin",
      dosage: "500mg",
      frequency: "twice_daily",
      scheduleTimes: ["08:00", "20:00"],
      startDate: toISODate(subDays(now, 30)),
      prescriber: "Dr. Sarah Chen",
      color: "#0D9488",
      refillReminderDays: 7,
      pillsPerDose: 1,
      totalPills: 60,
      isActive: true,
      createdAt: subDays(now, 30).toISOString(),
    },
    {
      id: generateId(),
      name: "Vitamin D3",
      dosage: "2000IU",
      frequency: "daily",
      scheduleTimes: ["09:00"],
      startDate: toISODate(subDays(now, 60)),
      prescriber: "Dr. Sarah Chen",
      color: "#F59E0B",
      refillReminderDays: 7,
      pillsPerDose: 1,
      totalPills: 90,
      isActive: true,
      createdAt: subDays(now, 60).toISOString(),
    },
    {
      id: generateId(),
      name: "Amoxicillin",
      dosage: "250mg",
      frequency: "three_times",
      scheduleTimes: ["08:00", "14:00", "20:00"],
      startDate: toISODate(subDays(now, 14)),
      endDate: toISODate(addDays(now, 7)),
      prescriber: "Dr. James Park",
      color: "#3B82F6",
      refillReminderDays: 5,
      pillsPerDose: 1,
      totalPills: 63,
      isActive: true,
      createdAt: subDays(now, 14).toISOString(),
    },
  ];
}

export function generateSeedLogs(medications: Medication[]): DoseLog[] {
  const logs: DoseLog[] = [];
  const statuses: Array<"taken" | "missed" | "skipped"> = ["taken", "taken", "taken", "missed", "skipped"];

  for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
    const date = subDays(now, dayOffset);
    const dateStr = toISODate(date);

    for (const med of medications) {
      for (const time of med.scheduleTimes) {
        const scheduledTime = new Date(`${dateStr}T${time}:00`).toISOString();
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        logs.push({
          id: generateId(),
          medicationId: med.id,
          scheduledTime,
          takenAt: status === "taken" ? new Date(`${dateStr}T${time}:00`).toISOString() : undefined,
          status,
          createdAt: scheduledTime,
        });
      }
    }
  }

  return logs;
}

export function generateSeedSymptoms(medications: Medication[]): SymptomEntry[] {
  return [
    {
      id: generateId(),
      date: toISODate(subDays(now, 2)),
      symptom: "Nausea",
      severity: 3,
      linkedMedicationIds: [medications[0].id],
      notes: "Felt nauseous after morning dose",
      createdAt: subDays(now, 2).toISOString(),
    },
    {
      id: generateId(),
      date: toISODate(subDays(now, 1)),
      symptom: "Headache",
      severity: 2,
      linkedMedicationIds: [medications[2].id],
      notes: "Mild headache in the afternoon",
      createdAt: subDays(now, 1).toISOString(),
    },
  ];
}
