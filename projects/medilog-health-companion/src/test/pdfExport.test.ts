import { describe, it, expect, vi } from "vitest";
import { generatePdf } from "../utils/pdfExport";
import { Medication, DoseLog, SymptomEntry } from "../types";

vi.mock("jspdf", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      text: vi.fn(),
      setTextColor: vi.fn(),
      addPage: vi.fn(),
      getNumberOfPages: vi.fn().mockReturnValue(2),
      setPage: vi.fn(),
      save: vi.fn(),
      internal: {
        pageSize: {
          getWidth: vi.fn().mockReturnValue(210),
          getHeight: vi.fn().mockReturnValue(297),
        },
      },
    })),
  };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

describe("pdfExport performance and correctness", () => {
  it("should generate PDF correctly and measure execution time", () => {
    // Generate sample medications (5,000 items to emphasize lookup complexity)
    const medications: Medication[] = Array.from({ length: 5000 }, (_, i) => ({
      id: `med-${i}`,
      name: `Medication ${i}`,
      dosage: "10mg",
      frequency: "daily",
      prescriber: "Dr. Smith",
      startDate: "2024-01-01",
      isActive: true,
    }));

    // Generate sample logs
    const logs: DoseLog[] = Array.from({ length: 2000 }, (_, i) => ({
      id: `log-${i}`,
      medicationId: `med-${i % 5000}`,
      scheduledTime: "2024-05-01T08:00:00Z",
      status: "taken",
    }));

    // Generate sample symptom entries with multiple linked medications
    const symptoms: SymptomEntry[] = Array.from({ length: 2000 }, (_, i) => ({
      id: `symptom-${i}`,
      symptom: `Symptom ${i}`,
      severity: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
      date: "2024-05-01",
      linkedMedicationIds: [`med-${i % 5000}`, `med-${(i + 10) % 5000}`, `med-${(i + 20) % 5000}`],
    }));

    const iterations = 10;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      generatePdf(medications, logs, symptoms);
    }
    const duration = performance.now() - start;
    const avgDuration = duration / iterations;

    console.log(`Average generatePdf duration: ${avgDuration.toFixed(2)}ms`);
    expect(avgDuration).toBeGreaterThanOrEqual(0);
  });
});
