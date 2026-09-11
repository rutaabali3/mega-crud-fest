import { describe, it, expect } from "vitest";

describe("HealthPage pet lookup performance benchmark", () => {
  it("compares Array.find vs Map.get lookup performance", () => {
    const numPets = 500;
    const numAppts = 5000;

    const pets = Array.from({ length: numPets }, (_, i) => ({
      id: `pet-${i}`,
      name: `Pet ${i}`,
      species: "dog" as const,
    }));

    const upcomingAppts = Array.from({ length: numAppts }, (_, i) => ({
      id: `appt-${i}`,
      petId: `pet-${i % numPets}`,
      reason: "Checkup",
      nextAppointmentDate: "2025-01-01",
    }));

    // Baseline: Array.find
    const startBaseline = performance.now();
    const baselineResults = upcomingAppts.map(a => pets.find(p => p.id === a.petId));
    const baselineTime = performance.now() - startBaseline;

    // Optimized: Map lookup
    const startOptimized = performance.now();
    const petMap = new Map(pets.map(p => [p.id, p]));
    const optimizedResults = upcomingAppts.map(a => petMap.get(a.petId));
    const optimizedTime = performance.now() - startOptimized;

    console.log(`Baseline (Array.find): ${baselineTime.toFixed(3)} ms`);
    console.log(`Optimized (Map.get): ${optimizedTime.toFixed(3)} ms`);
    console.log(`Speedup: ${(baselineTime / optimizedTime).toFixed(2)}x`);

    expect(baselineResults).toEqual(optimizedResults);
  });
});
