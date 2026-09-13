import { describe, it, expect } from "vitest";
import type { Pet, Vaccination } from "../lib/types";

describe("HealthPage pet lookup performance benchmark", () => {
  // Generate sample dataset
  const petCount = 500;
  const vaccineCount = 5000;

  const pets: Pet[] = Array.from({ length: petCount }, (_, i) => ({
    id: `pet-${i}`,
    name: `Pet ${i}`,
    species: "Dog",
    breed: "Mixed",
    dateOfBirth: "2020-01-01",
    sex: "Male",
    photoUrl: "",
    emoji: "🐶",
    notes: "",
    archived: false,
    createdAt: "2020-01-01T00:00:00Z",
  }));

  const vaccinations: Vaccination[] = Array.from({ length: vaccineCount }, (_, i) => ({
    id: `vac-${i}`,
    petId: `pet-${i % petCount}`,
    vaccineName: `Vaccine ${i}`,
    dateGiven: "2023-01-01",
    batchNumber: "B123",
    vetName: "Dr. Smith",
    nextDueDate: "2024-01-01",
    notes: "",
    createdAt: "2023-01-01T00:00:00Z",
  }));

  it("compares N+1 pets.find vs Map lookup speed", () => {
    // 1. Baseline: N+1 find in array
    const startFind = performance.now();
    const resultFind = vaccinations.map((v) => {
      const pet = pets.find((p) => p.id === v.petId);
      return pet?.name;
    });
    const timeFind = performance.now() - startFind;

    // 2. Optimized: Map O(1) lookup
    const startMap = performance.now();
    const petMap = new Map(pets.map((p) => [p.id, p]));
    const resultMap = vaccinations.map((v) => {
      const pet = petMap.get(v.petId);
      return pet?.name;
    });
    const timeMap = performance.now() - startMap;

    expect(resultFind).toEqual(resultMap);

    console.log(`\n--- BENCHMARK RESULTS ---`);
    console.log(`Dataset: ${petCount} pets, ${vaccineCount} vaccines`);
    console.log(`Baseline (pets.find inside map): ${timeFind.toFixed(3)} ms`);
    console.log(`Optimized (petMap.get inside map): ${timeMap.toFixed(3)} ms`);
    if (timeMap > 0) {
      console.log(`Speedup: ${(timeFind / timeMap).toFixed(2)}x faster`);
    }
    console.log(`-------------------------\n`);

    expect(timeMap).toBeLessThan(timeFind);
  });
});
