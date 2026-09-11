import { describe, it, expect, vi } from "vitest";
import { generatePdf } from "../utils/pdfExport";
import { Medication, DoseLog, SymptomEntry } from "../types";
import autoTable from "jspdf-autotable";

// Mock jspdf
vi.mock("jspdf", () => {
  const mockJsPDF = vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    getNumberOfPages: vi.fn().mockReturnValue(1),
    setPage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getWidth: vi.fn().mockReturnValue(210),
        getHeight: vi.fn().mockReturnValue(297),
      },
    },
  }));
  return {
    default: mockJsPDF,
  };
});

// Mock jspdf-autotable
vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("pdfExport", () => {
  it("generates PDF correctly and benchmarks performance", () => {
    const numMeds = 500;
    const numLogs = 5000;
    const numSymptoms = 2000;

    const medications: Medication[] = Array.from({ length: numMeds }, (_, i) => ({
      id: `med-${i}`,
      name: `Medication ${i}`,
      dosage: "10mg",
      frequency: "daily",
      prescriber: "Dr. Smith",
      startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
      endDate: null,
      isActive: true,
      notes: "Take with food",
      reminderTimes: ["08:00"],
    }));

    const nowMs = Date.now();
    const logs: DoseLog[] = Array.from({ length: numLogs }, (_, i) => ({
      id: `log-${i}`,
      medicationId: `med-${i % numMeds}`,
      scheduledTime: new Date(nowMs - i * 1000).toISOString(),
      takenTime: new Date(nowMs - i * 1000).toISOString(),
      status: i % 10 === 0 ? "missed" : "taken",
      notes: `Log note ${i}`,
    }));

    const symptoms: SymptomEntry[] = Array.from({ length: numSymptoms }, (_, i) => ({
      id: `symptom-${i}`,
      date: new Date(nowMs - i * 1000).toISOString(),
      symptom: `Symptom ${i}`,
      severity: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      linkedMedicationIds: [`med-${i % numMeds}`, `med-${(i + 1) % numMeds}`],
      notes: `Symptom note ${i}`,
    }));

    const autoTableMock = vi.mocked(autoTable);
    autoTableMock.mockClear();

    const start = performance.now();
    generatePdf(medications, logs, symptoms);
    const end = performance.now();

    console.log(`generatePdf execution time with ${numMeds} meds, ${numLogs} logs, ${numSymptoms} symptoms: ${(end - start).toFixed(2)} ms`);

    // Verify autoTable calls to ensure correct data lookup
    expect(autoTableMock).toHaveBeenCalledTimes(4);

    // Section 3 Dose Log check
    const doseLogCall = autoTableMock.mock.calls[2][1] as { body: (string | undefined)[][] };
    expect(doseLogCall.body.length).toBe(numLogs);

    // Section 4 Symptom Journal check
    const symptomCall = autoTableMock.mock.calls[3][1] as { body: (string | undefined)[][] };
    expect(symptomCall.body[0][3]).toBe("Medication 0, Medication 1");
  });
});
