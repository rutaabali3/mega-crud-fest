import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CalendarPage from "../pages/CalendarPage";
import { Medication, DoseLog } from "../types";

describe("CalendarPage performance", () => {
  it("renders efficiently with a large set of medications and dose logs", () => {
    // Generate 50 medications
    const medications: Medication[] = Array.from({ length: 50 }, (_, i) => ({
      id: `med-${i}`,
      name: `Medication ${i}`,
      dosage: "10mg",
      frequency: "daily",
      scheduleTimes: ["08:00"],
      startDate: "2025-01-01",
      prescriber: "Dr. Smith",
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
      refillReminderDays: 7,
      pillsPerDose: 1,
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
    }));

    // Generate 10,000 dose logs distributed across dates
    const statuses: DoseLog["status"][] = ["taken", "skipped", "missed", "pending"];
    const logs: DoseLog[] = Array.from({ length: 10000 }, (_, i) => {
      const day = (i % 30) + 1;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const medIndex = i % 50;
      return {
        id: `log-${i}`,
        medicationId: `med-${medIndex}`,
        scheduledTime: `2025-05-${dayStr}T08:00:00.000Z`,
        status: statuses[i % 4],
        createdAt: `2025-05-${dayStr}T08:00:00.000Z`,
      };
    });

    const iterations = 20;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<CalendarPage medications={medications} logs={logs} />);
      unmount();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const avgDuration = duration / iterations;

    console.log(`[Baseline Benchmark] Total duration for ${iterations} renders: ${duration.toFixed(2)}ms, Avg: ${avgDuration.toFixed(2)}ms`);

    expect(avgDuration).toBeLessThan(5000);
  });
});
