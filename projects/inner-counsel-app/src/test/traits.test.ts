import { describe, it, expect } from "vitest";

function addTrait(traits: string[], traitInput: string): string[] {
  const t = traitInput.trim();
  if (t && traits.length < 6 && !traits.includes(t)) {
    return [...traits, t];
  }
  return traits;
}

function removeTrait(traits: string[], index: number): string[] {
  return traits.filter((_, i) => i !== index);
}

describe("Trait management logic", () => {
  it("adds valid traits up to limit of 6", () => {
    let traits: string[] = [];
    for (let i = 1; i <= 6; i++) {
      traits = addTrait(traits, `Trait ${i}`);
    }
    expect(traits.length).toBe(6);
    expect(addTrait(traits, "Trait 7")).toEqual(traits);
  });

  it("prevents duplicate traits", () => {
    let traits = ["Wise", "Brave"];
    traits = addTrait(traits, "Wise");
    expect(traits).toEqual(["Wise", "Brave"]);
  });

  it("removes trait correctly by index", () => {
    const initialTraits = ["Wise", "Brave", "Patient"];
    const updated = removeTrait(initialTraits, 1);
    expect(updated).toEqual(["Wise", "Patient"]);
  });
});
