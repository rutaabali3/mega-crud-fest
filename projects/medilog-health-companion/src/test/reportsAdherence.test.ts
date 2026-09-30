import { describe, it, expect } from "vitest";
import { Medication, DoseLog } from "../types";

// Re-creating or importing the calculation logic for benchmark
export function calculatePerMedAdherenceOriginal(medications: Medication[], periodLogs: DoseLog[]) {
  return medications
    .filter((m) => m.isActive)
    .map((med) => {
      const medLogs = periodLogs.filter((l) => l.medicationId === med.id);
      const taken = medLogs.filter((l) => l.status === "taken").length;
      const rate = medLogs.length > 0 ? Math.round((taken / medLogs.length) * 100) : 0;
      return { name: med.name, adherence: rate, color: med.color };
    });
}

export function calculatePerMedAdherenceOptimized(medications: Medication[], periodLogs: DoseLog[]) {
  const activeMeds = medications.filter((m) => m.isActive);
  if (activeMeds.length === 0) return [];

  const statsByMed = new Map<string, { total: number; taken: number }>();
  for (let i = 0; i < periodLogs.length; i++) {
    const log = periodLogs[i];
    let stats = statsByMed.get(log.medicationId);
    if (!stats) {
      stats = { total: 0, taken: 0 };
      statsByMed.set(log.medicationId, stats);
    }
    stats.total += 1;
    if (log.status === "taken") {
      stats.taken += 1;
    }
  }

  return activeMeds.map((med) => {
    const stats = statsByMed.get(med.id);
    const total = stats ? stats.total : 0;
    const taken = stats ? stats.taken : 0;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { name: med.name, adherence: rate, color: med.color };
  });
}

describe("perMedAdherence optimization benchmark & correctness", () => {
  it("should return identical results for original and optimized implementations", () => {
    const medications: Medication[] = [
      { id: "med1", name: "Med 1", dosage: "10mg", frequency: "daily", scheduleTimes: ["08:00"], startDate: "2023-01-01", prescriber: "Dr. Smith", color: "#ff0000", refillReminderDays: 5, pillsPerDose: 1, isActive: true, createdAt: "2023-01-01" },
      { id: "med2", name: "Med 2", dosage: "20mg", frequency: "daily", scheduleTimes: ["09:00"], startDate: "2023-01-01", prescriber: "Dr. Jones", color: "#00ff00", refillReminderDays: 5, pillsPerDose: 1, isActive: true, createdAt: "2023-01-01" },
      { id: "med3", name: "Med 3", dosage: "5mg", frequency: "daily", scheduleTimes: ["10:00"], startDate: "2023-01-01", prescriber: "Dr. Adam", color: "#0000ff", refillReminderDays: 5, pillsPerDose: 1, isActive: false, createdAt: "2023-01-01" },
    ];

    const periodLogs: DoseLog[] = [
      { id: "l1", medicationId: "med1", scheduledTime: "2023-10-01T08:00:00Z", status: "taken", createdAt: "2023-10-01" },
      { id: "l2", medicationId: "med1", scheduledTime: "2023-10-02T08:00:00Z", status: "missed", createdAt: "2023-10-02" },
      { id: "l3", medicationId: "med2", scheduledTime: "2023-10-01T09:00:00Z", status: "taken", createdAt: "2023-10-01" },
      { id: "l4", medicationId: "med2", scheduledTime: "2023-10-02T09:00:00Z", status: "taken", createdAt: "2023-10-02" },
      { id: "l5", medicationId: "med3", scheduledTime: "2023-10-01T10:00:00Z", status: "taken", createdAt: "2023-10-01" },
    ];

    const resOriginal = calculatePerMedAdherenceOriginal(medications, periodLogs);
    const resOptimized = calculatePerMedAdherenceOptimized(medications, periodLogs);

    expect(resOptimized).toEqual(resOriginal);
  });

  it("benchmark performance difference", () => {
    // Generate synthetic dataset
    const numMeds = 100;
    const numLogs = 20000;

    const medications: Medication[] = Array.from({ length: numMeds }, (_, i) => ({
      id: `med-${i}`,
      name: `Medication ${i}`,
      dosage: "10mg",
      frequency: "daily",
      scheduleTimes: ["08:00"],
      startDate: "2023-01-01",
      prescriber: "Dr. Test",
      color: "#000000",
      refillReminderDays: 5,
      pillsPerDose: 1,
      isActive: i % 10 !== 0, // 90 active meds
      createdAt: "2023-01-01",
    }));

    const statuses: DoseLog["status"][] = ["taken", "missed", "skipped"];
    const periodLogs: DoseLog[] = Array.from({ length: numLogs }, (_, i) => ({
      id: `log-${i}`,
      medicationId: `med-${i % numMeds}`,
      scheduledTime: "2023-10-01T08:00:00Z",
      status: statuses[i % statuses.length],
      createdAt: "2023-10-01",
    }));

    // Measure Original
    const startOrig = performance.now();
    for (let r = 0; r < 5; r++) {
      calculatePerMedAdherenceOriginal(medications, periodLogs);
    }
    const durationOrig = (performance.now() - startOrig) / 5;

    // Measure Optimized
    const startOpt = performance.now();
    for (let r = 0; r < 5; r++) {
      calculatePerMedAdherenceOptimized(medications, periodLogs);
    }
    const durationOpt = (performance.now() - startOpt) / 5;

    console.log(`Original perMedAdherence average duration: ${durationOrig.toFixed(3)} ms`);
    console.log(`Optimized perMedAdherence average duration: ${durationOpt.toFixed(3)} ms`);
    console.log(`Speedup: ${(durationOrig / durationOpt).toFixed(2)}x`);

    expect(durationOpt).toBeLessThan(durationOrig);
  });
});
