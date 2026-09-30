import { describe, it, expect } from "vitest";
import { CATEGORIES, VaultEntry, Category } from "../lib/types";

function calculateCountsOld(entries: VaultEntry[]): Record<string, number> {
  const counts: Record<string, number> = { all: entries.length, favorites: entries.filter((e) => e.favorite).length };
  CATEGORIES.forEach((c) => { counts[c.value] = entries.filter((e) => e.category === c.value).length; });
  return counts;
}

function calculateCountsNew(entries: VaultEntry[]): Record<string, number> {
  const counts: Record<string, number> = {
    all: entries.length,
    favorites: 0,
  };
  CATEGORIES.forEach((c) => {
    counts[c.value] = 0;
  });

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.favorite) {
      counts.favorites++;
    }
    if (entry.category in counts) {
      counts[entry.category]++;
    }
  }

  return counts;
}

describe("VaultSidebar Counts Calculation", () => {
  const sampleEntries: VaultEntry[] = [
    {
      id: "1",
      siteName: "Site 1",
      siteUrl: "https://site1.com",
      username: "user1",
      password: { ciphertext: "", iv: "" },
      notes: null,
      category: "Social",
      favorite: true,
      createdAt: "",
      updatedAt: "",
      passwordHistory: [],
    },
    {
      id: "2",
      siteName: "Site 2",
      siteUrl: "https://site2.com",
      username: "user2",
      password: { ciphertext: "", iv: "" },
      notes: null,
      category: "Finance",
      favorite: false,
      createdAt: "",
      updatedAt: "",
      passwordHistory: [],
    },
    {
      id: "3",
      siteName: "Site 3",
      siteUrl: "https://site3.com",
      username: "user3",
      password: { ciphertext: "", iv: "" },
      notes: null,
      category: "Social",
      favorite: false,
      createdAt: "",
      updatedAt: "",
      passwordHistory: [],
    },
  ];

  it("produces identical output between old and new counting logic", () => {
    const oldCounts = calculateCountsOld(sampleEntries);
    const newCounts = calculateCountsNew(sampleEntries);

    expect(newCounts).toEqual(oldCounts);
    expect(newCounts.all).toBe(3);
    expect(newCounts.favorites).toBe(1);
    expect(newCounts.Social).toBe(2);
    expect(newCounts.Finance).toBe(1);
    expect(newCounts.Work).toBe(0);
  });

  it("benchmarks single pass O(N) vs multiple pass O(N*M)", () => {
    const categories: Category[] = ["Social", "Finance", "Work", "Shopping", "Email", "Gaming", "Other"];
    const largeEntries: VaultEntry[] = [];
    for (let i = 0; i < 50000; i++) {
      largeEntries.push({
        id: `id-${i}`,
        siteName: `Site ${i}`,
        siteUrl: `https://site${i}.com`,
        username: `user${i}`,
        password: { ciphertext: "", iv: "" },
        notes: null,
        category: categories[i % categories.length],
        favorite: i % 3 === 0,
        createdAt: "",
        updatedAt: "",
        passwordHistory: [],
      });
    }

    const startOld = performance.now();
    const oldRes = calculateCountsOld(largeEntries);
    const endOld = performance.now();

    const startNew = performance.now();
    const newRes = calculateCountsNew(largeEntries);
    const endNew = performance.now();

    const oldTime = endOld - startOld;
    const newTime = endNew - startNew;

    expect(newRes).toEqual(oldRes);
    console.log(`Old O(N*M) time: ${oldTime.toFixed(2)} ms, New O(N) time: ${newTime.toFixed(2)} ms`);
    expect(newTime).toBeLessThan(oldTime);
  });
});
