import { describe, test, expect } from 'vitest';
import type { Pet, Medication } from '../lib/types';

describe('MedicationsPage pet lookup performance benchmark', () => {
  test('compares Array.prototype.find O(N*M) vs Map lookup O(N+M)', () => {
    const petCount = 500;
    const medCount = 2000;

    const pets: Pet[] = Array.from({ length: petCount }, (_, i) => ({
      id: `pet-${i}`,
      name: `Pet ${i}`,
      species: 'Dog',
      breed: 'Breed',
      dateOfBirth: '2020-01-01',
      sex: 'Male',
      photoUrl: '',
      emoji: '🐶',
      notes: '',
      archived: false,
      createdAt: '2020-01-01',
    }));

    const medications: Medication[] = Array.from({ length: medCount }, (_, i) => ({
      id: `med-${i}`,
      petId: `pet-${i % petCount}`,
      name: `Medication ${i}`,
      dosage: '10mg',
      frequency: 'once_daily',
      startDate: '2024-01-01',
      endDate: i % 2 === 0 ? '2024-12-31' : '',
      prescribingVet: 'Dr. Smith',
      purpose: 'General Health',
      colorTag: '#4CAF78',
      doses: [],
      createdAt: '2024-01-01',
    }));

    // Baseline (Array.find for active and past meds)
    const startBaseline = performance.now();
    for (let iteration = 0; iteration < 20; iteration++) {
      const activeMeds = medications.filter(m => !m.endDate);
      const pastMeds = medications.filter(m => !!m.endDate);

      const activePetNames = activeMeds.map(med => {
        const pet = pets.find(p => p.id === med.petId);
        return pet?.name;
      });

      const pastPetNames = pastMeds.map(med => {
        const pet = pets.find(p => p.id === med.petId);
        return pet?.name;
      });
    }
    const baselineDuration = performance.now() - startBaseline;

    // Optimized (Map lookup)
    const startOptimized = performance.now();
    for (let iteration = 0; iteration < 20; iteration++) {
      const petMap = new Map(pets.map(p => [p.id, p]));
      const activeMeds = medications.filter(m => !m.endDate);
      const pastMeds = medications.filter(m => !!m.endDate);

      const activePetNames = activeMeds.map(med => {
        const pet = petMap.get(med.petId);
        return pet?.name;
      });

      const pastPetNames = pastMeds.map(med => {
        const pet = petMap.get(med.petId);
        return pet?.name;
      });
    }
    const optimizedDuration = performance.now() - startOptimized;

    console.log(`\n--- MEDICATIONS PAGE BENCHMARK RESULTS ---`);
    console.log(`Dataset: ${petCount} pets, ${medCount} medications (20 iterations)`);
    console.log(`Baseline (pets.find inside loop): ${baselineDuration.toFixed(3)} ms`);
    console.log(`Optimized (petMap.get inside loop): ${optimizedDuration.toFixed(3)} ms`);
    if (optimizedDuration > 0) {
      console.log(`Speedup: ${(baselineDuration / optimizedDuration).toFixed(2)}x faster`);
    }
    console.log(`------------------------------------------\n`);

    expect(optimizedDuration).toBeLessThan(baselineDuration);
  });
});
