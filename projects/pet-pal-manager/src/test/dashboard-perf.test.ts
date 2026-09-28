import { describe, test, expect } from 'vitest';
import { Pet, Medication, VetVisit } from '../lib/types';

describe('Dashboard medication pet name lookup performance', () => {
  test('benchmark O(N*M) find vs O(N+M) Map lookup', () => {
    // Generate test data: 500 pets and 1000 meds due
    const numPets = 500;
    const numMeds = 1000;

    const pets: Pet[] = Array.from({ length: numPets }, (_, i) => ({
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

    const medsDue: Medication[] = Array.from({ length: numMeds }, (_, i) => ({
      id: `med-${i}`,
      petId: `pet-${i % numPets}`,
      name: `Med ${i}`,
      dosage: '10mg',
      frequency: 'once_daily',
      startDate: '2024-01-01',
      endDate: '',
      prescribingVet: 'Dr. Smith',
      purpose: 'Health',
      colorTag: '#4CAF78',
      doses: [],
      createdAt: '2024-01-01',
    }));

    const activePets = pets.filter(p => !p.archived);

    // Baseline implementation (O(N*M))
    const startBaseline = performance.now();
    let baselineResult = '';
    for (let i = 0; i < 100; i++) {
      baselineResult = activePets.length > 0
        ? [...new Set(medsDue.map(m => pets.find(p => p.id === m.petId)?.name))].filter(Boolean).join(' & ')
        : '';
    }
    const endBaseline = performance.now();
    const baselineDuration = endBaseline - startBaseline;

    // Optimized implementation using Map (O(N+M))
    const startOptimized = performance.now();
    let optimizedResult = '';
    for (let i = 0; i < 100; i++) {
      const petMap = new Map(pets.map(p => [p.id, p]));
      optimizedResult = activePets.length > 0
        ? [...new Set(medsDue.map(m => petMap.get(m.petId)?.name))].filter(Boolean).join(' & ')
        : '';
    }
    const endOptimized = performance.now();
    const optimizedDuration = endOptimized - startOptimized;

    expect(baselineResult).toBe(optimizedResult);

    console.log(`Baseline (Array.find): ${baselineDuration.toFixed(2)} ms`);
    console.log(`Optimized (Map.get):   ${optimizedDuration.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineDuration / optimizedDuration).toFixed(2)}x faster`);

    expect(optimizedDuration).toBeLessThan(baselineDuration);
  });

  test('benchmark O(N*M) find vs Map lookup for upcoming appointments map', () => {
    const numPets = 500;
    const numAppts = 1000;

    const pets: Pet[] = Array.from({ length: numPets }, (_, i) => ({
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

    const upcomingAppts: VetVisit[] = Array.from({ length: numAppts }, (_, i) => ({
      id: `visit-${i}`,
      petId: `pet-${i % numPets}`,
      date: '2025-01-01',
      reason: 'Checkup',
      vetName: 'Dr. Smith',
      clinicName: 'Vet Clinic',
      notes: '',
      cost: 50,
      nextAppointmentDate: '2025-06-01',
      createdAt: '2025-01-01',
    }));

    // Baseline O(N*M)
    const startBaseline = performance.now();
    let baselinePets: (Pet | undefined)[] = [];
    for (let i = 0; i < 100; i++) {
      baselinePets = upcomingAppts.map(appt => pets.find(p => p.id === appt.petId));
    }
    const endBaseline = performance.now();
    const baselineDuration = endBaseline - startBaseline;

    // Optimized O(1) via Map
    const startOptimized = performance.now();
    let optimizedPets: (Pet | undefined)[] = [];
    for (let i = 0; i < 100; i++) {
      const petMap = new Map(pets.map(p => [p.id, p]));
      optimizedPets = upcomingAppts.map(appt => petMap.get(appt.petId));
    }
    const endOptimized = performance.now();
    const optimizedDuration = endOptimized - startOptimized;

    expect(baselinePets).toEqual(optimizedPets);

    console.log(`Upcoming Appts Baseline (Array.find): ${baselineDuration.toFixed(2)} ms`);
    console.log(`Upcoming Appts Optimized (Map.get):   ${optimizedDuration.toFixed(2)} ms`);
    console.log(`Speedup: ${(baselineDuration / optimizedDuration).toFixed(2)}x faster`);

    expect(optimizedDuration).toBeLessThan(baselineDuration);
  });
});
