import { describe, it, expect } from 'vitest';
import type { Pet, FeedingLog, Medication } from '../lib/types';

describe('FeedingPage and MedicationsPage lookup performance', () => {
  it('compares O(N*M) array.find with O(N+M) Map lookup for feeding logs', () => {
    const numPets = 500;
    const numLogs = 5000;

    const pets: Pet[] = Array.from({ length: numPets }, (_, i) => ({
      id: `pet-${i}`,
      name: `Pet ${i}`,
      species: 'dog',
      breed: 'Breed',
      dateOfBirth: '2020-01-01',
      sex: 'Male',
      photoUrl: '',
      emoji: '🐶',
      notes: '',
      archived: false,
      createdAt: '2020-01-01',
    }));

    const logs: FeedingLog[] = Array.from({ length: numLogs }, (_, i) => ({
      id: `log-${i}`,
      petId: `pet-${i % numPets}`,
      foodType: 'Kibble',
      amount: 100,
      unit: 'g',
      dateTime: '2025-01-01T08:00:00Z',
      notes: '',
      createdAt: '2025-01-01T08:00:00Z',
    }));

    // Baseline: Array.find
    const startBaseline = performance.now();
    const baselineResult = logs.map(log => {
      const pet = pets.find(p => p.id === log.petId);
      return pet ? pet.name : '?';
    });
    const baselineDuration = performance.now() - startBaseline;

    // Optimized: Map.get
    const startOptimized = performance.now();
    const petMap = new Map(pets.map(p => [p.id, p]));
    const optimizedResult = logs.map(log => {
      const pet = petMap.get(log.petId);
      return pet ? pet.name : '?';
    });
    const optimizedDuration = performance.now() - startOptimized;

    expect(baselineResult).toEqual(optimizedResult);

    console.log(`Feeding Logs Baseline (Array.find): ${baselineDuration.toFixed(3)} ms`);
    console.log(`Feeding Logs Optimized (Map.get):   ${optimizedDuration.toFixed(3)} ms`);
    console.log(`Speedup: ${(baselineDuration / Math.max(optimizedDuration, 0.001)).toFixed(2)}x faster`);

    expect(optimizedDuration).toBeLessThan(baselineDuration);
  });

  it('compares O(N*M) array.find with O(N+M) Map lookup for medications', () => {
    const numPets = 500;
    const numMeds = 5000;

    const pets: Pet[] = Array.from({ length: numPets }, (_, i) => ({
      id: `pet-${i}`,
      name: `Pet ${i}`,
      species: 'dog',
      breed: 'Breed',
      dateOfBirth: '2020-01-01',
      sex: 'Male',
      photoUrl: '',
      emoji: '🐶',
      notes: '',
      archived: false,
      createdAt: '2020-01-01',
    }));

    const meds: Medication[] = Array.from({ length: numMeds }, (_, i) => ({
      id: `med-${i}`,
      petId: `pet-${i % numPets}`,
      name: `Med ${i}`,
      dosage: '10mg',
      frequency: 'once_daily',
      startDate: '2025-01-01',
      endDate: '',
      prescribingVet: 'Vet',
      purpose: 'Health',
      colorTag: '#4CAF78',
      doses: [],
      createdAt: '2025-01-01',
    }));

    // Baseline: Array.find
    const startBaseline = performance.now();
    const baselineResult = meds.map(med => {
      const pet = pets.find(p => p.id === med.petId);
      return pet ? pet.name : '?';
    });
    const baselineDuration = performance.now() - startBaseline;

    // Optimized: Map.get
    const startOptimized = performance.now();
    const petMap = new Map(pets.map(p => [p.id, p]));
    const optimizedResult = meds.map(med => {
      const pet = petMap.get(med.petId);
      return pet ? pet.name : '?';
    });
    const optimizedDuration = performance.now() - startOptimized;

    expect(baselineResult).toEqual(optimizedResult);

    console.log(`Medications Baseline (Array.find): ${baselineDuration.toFixed(3)} ms`);
    console.log(`Medications Optimized (Map.get):   ${optimizedDuration.toFixed(3)} ms`);
    console.log(`Speedup: ${(baselineDuration / Math.max(optimizedDuration, 0.001)).toFixed(2)}x faster`);

    expect(optimizedDuration).toBeLessThan(baselineDuration);
  });
});
