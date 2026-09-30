import { describe, it, expect } from "vitest";

function removeTraitOld(traits: string[], indexToRemove: number): string[] {
  // Simulates creating inline onClick callback for every item during render:
  // onClick={() => setTraits(traits.filter((x) => x !== t))}
  const callbacks = traits.map((t) => () => traits.filter((x) => x !== t));
  return callbacks[indexToRemove]();
}

function removeTraitNew(traits: string[], indexToRemove: number): string[] {
  // Direct removal by index:
  return traits.filter((_, i) => i !== indexToRemove);
}

describe("Trait removal benchmark", () => {
  it("compares performance of nested filter vs index removal", () => {
    const traits = Array.from({ length: 6 }, (_, i) => `Trait ${i}`);
    const iterations = 100_000;

    const startOld = performance.now();
    for (let i = 0; i < iterations; i++) {
      removeTraitOld(traits, i % traits.length);
    }
    const endOld = performance.now();
    const oldDuration = endOld - startOld;

    const startNew = performance.now();
    for (let i = 0; i < iterations; i++) {
      removeTraitNew(traits, i % traits.length);
    }
    const endNew = performance.now();
    const newDuration = endNew - startNew;

    console.log(`Old method duration (${iterations} ops): ${oldDuration.toFixed(2)}ms`);
    console.log(`New method duration (${iterations} ops): ${newDuration.toFixed(2)}ms`);
    console.log(`Speedup: ${(oldDuration / newDuration).toFixed(2)}x faster`);

    expect(removeTraitOld(traits, 2)).toEqual(removeTraitNew(traits, 2));
  });
});
