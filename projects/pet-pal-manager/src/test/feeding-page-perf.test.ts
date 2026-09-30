import { describe, test, expect } from 'vitest';
import type { Pet, FeedingSchedule, FeedingLog } from '../lib/types';

describe('FeedingPage schedules and logs calculation performance', () => {
  test('compares nested array filter O(N*M*L) with Map/Set pre-computed lookup O(N+M+L)', () => {
    const numPets = 200;
    const schedulesPerPet = 5;
    const logsCount = 1000;

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

    const feedingSchedules: FeedingSchedule[] = [];
    for (let i = 0; i < numPets; i++) {
      for (let j = 0; j < schedulesPerPet; j++) {
        feedingSchedules.push({
          id: `sched-${i}-${j}`,
          petId: `pet-${i}`,
          foodType: `Food ${j}`,
          amount: 100,
          unit: 'g',
          timesPerDay: 3,
          specificTimes: ['08:00', '12:00', '18:00'],
          notes: '',
          active: true,
          createdAt: '2024-01-01',
        });
      }
    }

    const todayStr = '2025-01-01';
    const feedingLogs: FeedingLog[] = Array.from({ length: logsCount }, (_, i) => {
      const petIndex = i % numPets;
      const schedIndex = i % schedulesPerPet;
      const times = ['08:00', '12:00', '18:00'];
      const time = times[i % times.length];
      return {
        id: `log-${i}`,
        petId: `pet-${petIndex}`,
        scheduleId: `sched-${petIndex}-${schedIndex}`,
        dateTime: `${todayStr}T${time}:00`,
        foodType: `Food ${schedIndex}`,
        amount: 100,
        unit: 'g',
        notes: '',
        createdAt: '2025-01-01',
      };
    });

    const activePets = pets.filter(p => !p.archived);
    const iterations = 100;

    // Baseline implementation
    const startBaseline = performance.now();
    let baselineResults: { petId: string; totalMeals: number; doneMeals: number }[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      const todayLogs = feedingLogs.filter(l => l.dateTime.startsWith(todayStr));
      const isMealDone = (scheduleId: string, time: string) =>
        todayLogs.some(l => l.scheduleId === scheduleId && l.dateTime.includes(time));

      baselineResults = activePets.map(pet => {
        const petSchedules = feedingSchedules.filter(s => s.petId === pet.id && s.active);
        if (!petSchedules.length) return { petId: pet.id, totalMeals: 0, doneMeals: 0 };
        const totalMeals = petSchedules.reduce((sum, s) => sum + s.timesPerDay, 0);
        const doneMeals = petSchedules.reduce((sum, s) => sum + s.specificTimes.filter(t => isMealDone(s.id, t)).length, 0);
        return { petId: pet.id, totalMeals, doneMeals };
      });
    }
    const durationBaseline = performance.now() - startBaseline;

    // Optimized implementation
    const startOptimized = performance.now();
    let optimizedResults: { petId: string; totalMeals: number; doneMeals: number }[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      const todayLogs = feedingLogs.filter(l => l.dateTime.startsWith(todayStr));

      // Build Set of done meals: key = scheduleId + '|' + time
      const doneMealSet = new Set<string>();
      for (let i = 0; i < todayLogs.length; i++) {
        const log = todayLogs[i];
        if (log.scheduleId) {
          // extract HH:mm from dateTime (YYYY-MM-DDTHH:mm:ss)
          const time = log.dateTime.slice(11, 16);
          doneMealSet.add(`${log.scheduleId}|${time}`);
        }
      }

      // Group active schedules by petId
      const schedulesByPet = new Map<string, FeedingSchedule[]>();
      for (let i = 0; i < feedingSchedules.length; i++) {
        const s = feedingSchedules[i];
        if (s.active) {
          let list = schedulesByPet.get(s.petId);
          if (!list) {
            list = [];
            schedulesByPet.set(s.petId, list);
          }
          list.push(s);
        }
      }

      const isMealDoneOpt = (scheduleId: string, time: string) => doneMealSet.has(`${scheduleId}|${time}`);

      optimizedResults = activePets.map(pet => {
        const petSchedules = schedulesByPet.get(pet.id);
        if (!petSchedules || petSchedules.length === 0) return { petId: pet.id, totalMeals: 0, doneMeals: 0 };
        const totalMeals = petSchedules.reduce((sum, s) => sum + s.timesPerDay, 0);
        const doneMeals = petSchedules.reduce((sum, s) => sum + s.specificTimes.filter(t => isMealDoneOpt(s.id, t)).length, 0);
        return { petId: pet.id, totalMeals, doneMeals };
      });
    }
    const durationOptimized = performance.now() - startOptimized;

    expect(optimizedResults).toEqual(baselineResults);

    const speedup = durationBaseline / durationOptimized;
    console.log(`Baseline time: ${durationBaseline.toFixed(2)} ms`);
    console.log(`Optimized time: ${durationOptimized.toFixed(2)} ms`);
    console.log(`Speedup factor: ${speedup.toFixed(2)}x faster`);

    expect(durationOptimized).toBeLessThan(durationBaseline);
  });
});
