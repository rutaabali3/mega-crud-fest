import { describe, it, expect } from "vitest";

function originalRemoveTrait(traits: string[], t: string): string[] {
  return traits.filter((x) => x !== t);
}

function optimizedRemoveTraitIndex(traits: string[], index: number): string[] {
  return traits.filter((_, i) => i !== index);
}

describe("Traits Removal Benchmark & Test", () => {
  it("verifies correctness of removal logic", () => {
    const traits = ["Wise", "Strategic", "Patient", "Bold"];
    expect(originalRemoveTrait(traits, "Strategic")).toEqual(["Wise", "Patient", "Bold"]);
    expect(optimizedRemoveTraitIndex(traits, 1)).toEqual(["Wise", "Patient", "Bold"]);
  });

  it("benchmarks execution time for traits removal", () => {
    // Generate array of N elements
    const N = 1000;
    const traits = Array.from({ length: N }, (_, i) => `trait-${i}`);

    // Measure original: removing each element by filtering entire array by value (O(N^2) total across all items)
    const startOrig = performance.now();
    for (let iter = 0; iter < 100; iter++) {
      for (let i = 0; i < N; i++) {
        const item = traits[i];
        originalRemoveTrait(traits, item);
      }
    }
    const endOrig = performance.now();
    const origTime = endOrig - startOrig;

    // Measure optimized: removing each element by index (O(N) per deletion, single pass by index)
    const startOpt = performance.now();
    for (let iter = 0; iter < 100; iter++) {
      for (let i = 0; i < N; i++) {
        optimizedRemoveTraitIndex(traits, i);
      }
    }
    const endOpt = performance.now();
    const optTime = endOpt - startOpt;

    console.log(`Original total time for 100x${N} removals: ${origTime.toFixed(2)} ms`);
    console.log(`Optimized total time for 100x${N} removals: ${optTime.toFixed(2)} ms`);

    expect(optTime).toBeLessThan(origTime + 50); // Sanity check
  });
});
