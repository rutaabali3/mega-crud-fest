import { describe, it, expect } from "vitest";
import type { Pet, VetVisit } from "../lib/types";

describe("Pet Lookup Performance Benchmark", () => {
  it("compares linear array.find O(N*M) with Map lookup O(N+M)", () => {
    const numPets = 500;
    const numVisits = 5000;

    const pets: Pet[] = Array.from({ length: numPets }, (_, i) => ({
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
      createdAt: new Date().toISOString(),
    }));

    const visits: VetVisit[] = Array.from({ length: numVisits }, (_, i) => ({
      id: `visit-${i}`,
      petId: `pet-${i % numPets}`,
      visitDate: "2025-01-01",
      vetName: "Dr. Smith",
      reason: "Checkup",
      diagnosis: "Healthy",
      treatment: "None",
      cost: 50,
      nextAppointmentDate: "",
      attachmentsNote: "",
      createdAt: new Date().toISOString(),
    }));

    // Baseline approach: array.find inside loop
    const startFind = performance.now();
    const findResults = visits.map(v => pets.find(p => p.id === v.petId));
    const findTime = performance.now() - startFind;

    // Map lookup approach
    const startMap = performance.now();
    const petMap = new Map(pets.map(p => [p.id, p]));
    const mapResults = visits.map(v => petMap.get(v.petId));
    const mapTime = performance.now() - startMap;

    expect(mapResults).toEqual(findResults);
    console.log(`[Benchmark] Array.find approach: ${findTime.toFixed(3)} ms`);
    console.log(`[Benchmark] Map.get approach: ${mapTime.toFixed(3)} ms`);
    console.log(`[Benchmark] Speedup factor: ${(findTime / mapTime).toFixed(2)}x`);

    expect(mapTime).toBeLessThan(findTime);
  });
});
