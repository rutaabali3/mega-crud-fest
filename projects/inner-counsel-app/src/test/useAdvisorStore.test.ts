import { describe, it, expect, beforeEach } from 'vitest';
import { useAdvisorStore } from '../store/useAdvisorStore';

describe('useAdvisorStore reorderAdvisors', () => {
  beforeEach(() => {
    useAdvisorStore.setState({ advisors: [], sessions: [] });
  });

  it('correctly reorders advisors and preserves remaining advisors', () => {
    const store = useAdvisorStore.getState();

    // Add advisors
    const a1 = store.addAdvisor({ name: 'A1', role: 'Role 1', description: '', category: 'Career', avatar: '', color: '#000', prompt: '' });
    const a2 = store.addAdvisor({ name: 'A2', role: 'Role 2', description: '', category: 'Career', avatar: '', color: '#000', prompt: '' });
    const a3 = store.addAdvisor({ name: 'A3', role: 'Role 3', description: '', category: 'Career', avatar: '', color: '#000', prompt: '' });
    const a4 = store.addAdvisor({ name: 'A4', role: 'Role 4', description: '', category: 'Career', avatar: '', color: '#000', prompt: '' });

    // Reorder a3 and a1, leaving a2 and a4 at the end
    useAdvisorStore.getState().reorderAdvisors([a3.id, a1.id]);

    const currentAdvisors = useAdvisorStore.getState().advisors;
    expect(currentAdvisors.map((a) => a.id)).toEqual([a3.id, a1.id, a2.id, a4.id]);
  });

  it('benchmark reorderAdvisors performance with 10,000 advisors', { timeout: 30000 }, () => {
    const advisorCount = 10000;
    const initialAdvisors = Array.from({ length: advisorCount }, (_, i) => ({
      id: `advisor-${i}`,
      name: `Advisor ${i}`,
      role: `Role ${i}`,
      description: `Desc ${i}`,
      category: 'General',
      avatar: '',
      color: '#000',
      prompt: '',
      createdAt: new Date().toISOString(),
    }));

    useAdvisorStore.setState({ advisors: initialAdvisors });

    // Pick 5,000 IDs to reorder
    const reorderIds = Array.from({ length: 5000 }, (_, i) => `advisor-${i * 2}`);

    const start = performance.now();
    for (let i = 0; i < 20; i++) {
      useAdvisorStore.getState().reorderAdvisors(reorderIds);
    }
    const end = performance.now();
    const duration = end - start;

    console.log(`[BENCHMARK BASELINE] reorderAdvisors x20 with 10,000 items took: ${duration.toFixed(2)} ms`);
    expect(useAdvisorStore.getState().advisors.length).toBe(advisorCount);
  });
});
