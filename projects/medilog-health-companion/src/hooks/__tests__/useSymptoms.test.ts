import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useSymptoms } from "../useSymptoms";
import { SymptomEntry } from "@/types";

const KEY = "medilog_symptoms";

describe("useSymptoms", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with an empty array when localStorage is empty", () => {
    const { result } = renderHook(() => useSymptoms());

    expect(result.current.symptoms).toEqual([]);
  });

  it("should initialize with stored symptoms from localStorage", () => {
    const mockSymptoms: SymptomEntry[] = [
      {
        id: "sym-1",
        date: "2025-01-01",
        symptom: "Headache",
        severity: 3,
        linkedMedicationIds: ["med-1"],
        notes: "Mild headache in morning",
        createdAt: "2025-01-01T08:00:00.000Z",
      },
    ];

    localStorage.setItem(KEY, JSON.stringify(mockSymptoms));

    const { result } = renderHook(() => useSymptoms());

    expect(result.current.symptoms).toEqual(mockSymptoms);
  });

  it("should add a new symptom entry with generated id and createdAt", () => {
    const { result } = renderHook(() => useSymptoms());

    let addedEntry: SymptomEntry | undefined;

    act(() => {
      addedEntry = result.current.addSymptom({
        date: "2025-01-02",
        symptom: "Nausea",
        severity: 2,
        linkedMedicationIds: [],
        notes: "Felt nauseous after lunch",
      });
    });

    expect(addedEntry).toBeDefined();
    expect(addedEntry?.id).toBeDefined();
    expect(typeof addedEntry?.id).toBe("string");
    expect(addedEntry?.createdAt).toBeDefined();
    expect(addedEntry?.symptom).toBe("Nausea");

    expect(result.current.symptoms).toHaveLength(1);
    expect(result.current.symptoms[0]).toEqual(addedEntry);

    const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(addedEntry);
  });

  it("should update an existing symptom by id", () => {
    const initialSymptoms: SymptomEntry[] = [
      {
        id: "sym-123",
        date: "2025-01-01",
        symptom: "Dizziness",
        severity: 2,
        linkedMedicationIds: [],
        notes: "Felt lightheaded",
        createdAt: "2025-01-01T10:00:00.000Z",
      },
    ];

    localStorage.setItem(KEY, JSON.stringify(initialSymptoms));

    const { result } = renderHook(() => useSymptoms());

    act(() => {
      result.current.updateSymptom("sym-123", {
        severity: 4,
        notes: "Dizziness worsened",
      });
    });

    expect(result.current.symptoms).toHaveLength(1);
    expect(result.current.symptoms[0]).toEqual({
      ...initialSymptoms[0],
      severity: 4,
      notes: "Dizziness worsened",
    });

    const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(stored[0].severity).toBe(4);
    expect(stored[0].notes).toBe("Dizziness worsened");
  });

  it("should not modify symptoms when updating with a non-matching id", () => {
    const initialSymptoms: SymptomEntry[] = [
      {
        id: "sym-123",
        date: "2025-01-01",
        symptom: "Dizziness",
        severity: 2,
        linkedMedicationIds: [],
        createdAt: "2025-01-01T10:00:00.000Z",
      },
    ];

    localStorage.setItem(KEY, JSON.stringify(initialSymptoms));

    const { result } = renderHook(() => useSymptoms());

    act(() => {
      result.current.updateSymptom("non-existent-id", { severity: 5 });
    });

    expect(result.current.symptoms).toEqual(initialSymptoms);
  });

  it("should delete a symptom by id", () => {
    const initialSymptoms: SymptomEntry[] = [
      {
        id: "sym-1",
        date: "2025-01-01",
        symptom: "Headache",
        severity: 2,
        linkedMedicationIds: [],
        createdAt: "2025-01-01T08:00:00.000Z",
      },
      {
        id: "sym-2",
        date: "2025-01-02",
        symptom: "Fatigue",
        severity: 3,
        linkedMedicationIds: [],
        createdAt: "2025-01-02T08:00:00.000Z",
      },
    ];

    localStorage.setItem(KEY, JSON.stringify(initialSymptoms));

    const { result } = renderHook(() => useSymptoms());

    act(() => {
      result.current.deleteSymptom("sym-1");
    });

    expect(result.current.symptoms).toHaveLength(1);
    expect(result.current.symptoms[0].id).toBe("sym-2");

    const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("sym-2");
  });

  it("should allow setSymptoms to directly replace state and update localStorage", () => {
    const { result } = renderHook(() => useSymptoms());

    const newSymptoms: SymptomEntry[] = [
      {
        id: "sym-direct",
        date: "2025-01-05",
        symptom: "Insomnia",
        severity: 1,
        linkedMedicationIds: [],
        createdAt: "2025-01-05T22:00:00.000Z",
      },
    ];

    act(() => {
      result.current.setSymptoms(newSymptoms);
    });

    expect(result.current.symptoms).toEqual(newSymptoms);

    const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    expect(stored).toEqual(newSymptoms);
  });
});
