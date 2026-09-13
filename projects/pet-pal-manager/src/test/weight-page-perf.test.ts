import { describe, it, expect } from "vitest";

interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  archived?: boolean;
}

interface WeightEntry {
  id: string;
  petId: string;
  weight: number;
  unit: 'kg' | 'lbs' | 'g';
  date: string;
  notes: string;
  createdAt: string;
}

describe("WeightPage lookup performance", () => {
  it("compares array.find O(N*M) with Map lookup O(M)", () => {
    // Generate test data: 500 pets, 5,000 weight entries
    const numPets = 500;
    const numEntries = 5000;

    const pets: Pet[] = Array.from({ length: numPets }, (_, i) => ({
      id: `pet-${i}`,
      name: `Pet ${i}`,
      species: 'dog',
    }));

    const tableData: WeightEntry[] = Array.from({ length: numEntries }, (_, i) => ({
      id: `weight-${i}`,
      petId: `pet-${i % numPets}`,
      weight: 10 + (i % 20),
      unit: 'kg',
      date: '2025-01-01',
      notes: '',
      createdAt: '2025-01-01T00:00:00Z',
    }));

    // Baseline approach: array.find inside map loop
    const startFind = performance.now();
    const resultFind = tableData.map((w) => {
      const pet = pets.find((p) => p.id === w.petId);
      return pet ? pet.name : '?';
    });
    const timeFind = performance.now() - startFind;

    // Optimized approach: Map lookup inside map loop
    const startMap = performance.now();
    const petsMap = new Map(pets.map((p) => [p.id, p]));
    const resultMap = tableData.map((w) => {
      const pet = petsMap.get(w.petId);
      return pet ? pet.name : '?';
    });
    const timeMap = performance.now() - startMap;

    expect(resultFind).toEqual(resultMap);
    console.log(`Array find baseline time: ${timeFind.toFixed(3)} ms`);
    console.log(`Map lookup optimized time: ${timeMap.toFixed(3)} ms`);
    console.log(`Speedup: ${(timeFind / Math.max(timeMap, 0.001)).toFixed(2)}x`);

    expect(timeMap).toBeLessThan(timeFind);
  });
});
