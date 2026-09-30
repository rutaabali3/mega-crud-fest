import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPackingTemplate, generateId } from "../lib/tripUtils";

describe("getPackingTemplate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns template categories for valid template keys", () => {
    const keys = ["beach", "business", "mountain", "city", "camping", "roadtrip", "default"];

    for (const key of keys) {
      const categories = getPackingTemplate(key);
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      categories.forEach((cat) => {
        expect(cat.name).toBeTruthy();
        expect(cat.color).toBeTruthy();
        expect(Array.isArray(cat.items)).toBe(true);
        expect(cat.items.length).toBeGreaterThan(0);

        cat.items.forEach((item) => {
          expect(item.name).toBeTruthy();
          expect(typeof item.quantity).toBe("number");
          expect(typeof item.packed).toBe("boolean");
          expect(typeof item.essential).toBe("boolean");
        });
      });
    }
  });

  it("returns specific items for the beach template", () => {
    const categories = getPackingTemplate("beach");
    const categoryNames = categories.map((c) => c.name);
    expect(categoryNames).toEqual(["Beachwear", "Sun Protection"]);

    const beachwear = categories.find((c) => c.name === "Beachwear");
    expect(beachwear).toBeDefined();
    expect(beachwear?.items.map((i) => i.name)).toContain("Swimsuit");
    expect(beachwear?.items.map((i) => i.name)).toContain("Flip flops");
  });

  it("returns specific items for the roadtrip template", () => {
    const categories = getPackingTemplate("roadtrip");
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe("Road Trip Essentials");
    expect(categories[0].items).toHaveLength(4);
    expect(categories[0].items.map((i) => i.name)).toEqual([
      "Snacks & drinks",
      "Car charger",
      "Playlist/podcasts downloaded",
      "Cooler",
    ]);
  });

  it("falls back to default template when an unknown or empty key is provided", () => {
    const defaultTemplate = getPackingTemplate("default");

    const unknownTemplate = getPackingTemplate("nonexistent_key");
    expect(unknownTemplate.map((c) => c.name)).toEqual(defaultTemplate.map((c) => c.name));

    const emptyTemplate = getPackingTemplate("");
    expect(emptyTemplate.map((c) => c.name)).toEqual(defaultTemplate.map((c) => c.name));
  });

  it("assigns newly generated IDs to all categories and items", () => {
    let idCounter = 1;
    vi.spyOn(crypto, "randomUUID").mockImplementation(
      () => `generated-uuid-${idCounter++}` as `${string}-${string}-${string}-${string}-${string}`
    );

    const categories = getPackingTemplate("roadtrip");

    // Roadtrip template has 1 category with 4 items -> total 5 generateId calls
    expect(categories[0].id).toBe("generated-uuid-1");
    expect(categories[0].items[0].id).toBe("generated-uuid-2");
    expect(categories[0].items[1].id).toBe("generated-uuid-3");
    expect(categories[0].items[2].id).toBe("generated-uuid-4");
    expect(categories[0].items[3].id).toBe("generated-uuid-5");
  });

  it("ensures all generated IDs are unique across categories and items", () => {
    const categories = getPackingTemplate("default");
    const allIds: string[] = [];

    categories.forEach((c) => {
      allIds.push(c.id);
      c.items.forEach((i) => {
        allIds.push(i.id);
      });
    });

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
    allIds.forEach((id) => {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  it("returns independent fresh object instances on subsequent calls", () => {
    const template1 = getPackingTemplate("city");
    const template2 = getPackingTemplate("city");

    expect(template1).not.toBe(template2);
    expect(template1[0]).not.toBe(template2[0]);
    expect(template1[0].items[0]).not.toBe(template2[0].items[0]);

    // Modifying template1 should not affect template2
    template1[0].name = "Modified City Name";
    template1[0].items[0].name = "Modified Item Name";

    expect(template2[0].name).toBe("City Essentials");
    expect(template2[0].items[0].name).toBe("Comfortable walking shoes");
  });
});
