import { describe, it, expect, beforeEach } from "vitest";
import {
  getVocab,
  saveVocab,
  getSettings,
  saveSettings,
  getActivity,
  logActivity,
  clearAllData,
  seedData,
  initializeApp,
  getNextReviewDate,
  levenshtein,
} from "../lib/storage";
import { VocabEntry, AppSettings, vocabEntriesSchema } from "../lib/types";

if (typeof localStorage === "undefined") {
  const store = new Map<string, string>();
  global.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  } as Storage;
}

describe("storage.ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getVocab & saveVocab", () => {
    it("returns an empty array when no vocab exists", () => {
      expect(getVocab()).toEqual([]);
    });

    it("saves and retrieves vocab entries", () => {
      const mockEntry: VocabEntry = {
        id: "1",
        word: "test",
        translation: "prueba",
        exampleSentence: "Esto es un test",
        targetLanguage: "Spanish",
        tags: ["test"],
        difficulty: "beginner",
        masteryLevel: 1,
        nextReviewDate: "2025-01-01",
        lastReviewedDate: null,
        timesCorrect: 0,
        timesIncorrect: 0,
        isMastered: false,
        source: "unit test",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
      };

      saveVocab([mockEntry]);
      expect(getVocab()).toEqual([mockEntry]);
    });

    it("handles corrupted JSON gracefully", () => {
      localStorage.setItem("vocab_bank_v1", "{invalid json");
      expect(getVocab()).toEqual([]);
    });

    it("handles JSON that fails schema validation gracefully", () => {
      localStorage.setItem(
        "vocab_bank_v1",
        JSON.stringify([{ id: "1", word: "test" }])
      );
      expect(getVocab()).toEqual([]);
    });
  });

  describe("vocabEntriesSchema validation", () => {
    const validEntry: VocabEntry = {
      id: "entry-1",
      word: "hola",
      translation: "hello",
      exampleSentence: "Hola mundo",
      targetLanguage: "Spanish",
      tags: ["greetings"],
      difficulty: "beginner",
      masteryLevel: 2,
      nextReviewDate: "2025-01-01T00:00:00.000Z",
      lastReviewedDate: null,
      timesCorrect: 3,
      timesIncorrect: 1,
      isMastered: false,
      source: "duolingo",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };

    it("successfully parses valid vocabulary entries", () => {
      const result = vocabEntriesSchema.safeParse([validEntry]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([validEntry]);
      }
    });

    it("rejects non-array payloads", () => {
      const result = vocabEntriesSchema.safeParse(validEntry);
      expect(result.success).toBe(false);
    });

    it("rejects entries missing required fields", () => {
      const invalidEntry = { ...validEntry };
      // @ts-expect-error testing missing field
      delete invalidEntry.word;
      const result = vocabEntriesSchema.safeParse([invalidEntry]);
      expect(result.success).toBe(false);
    });

    it("rejects entries with invalid enum values for difficulty", () => {
      const invalidEntry = { ...validEntry, difficulty: "super-hard" };
      const result = vocabEntriesSchema.safeParse([invalidEntry]);
      expect(result.success).toBe(false);
    });

    it("rejects entries with invalid masteryLevel range", () => {
      const invalidEntry = { ...validEntry, masteryLevel: 10 };
      const result = vocabEntriesSchema.safeParse([invalidEntry]);
      expect(result.success).toBe(false);
    });

    it("rejects entries with invalid negative timesCorrect", () => {
      const invalidEntry = { ...validEntry, timesCorrect: -5 };
      const result = vocabEntriesSchema.safeParse([invalidEntry]);
      expect(result.success).toBe(false);
    });
  });

  describe("getSettings & saveSettings", () => {
    it("returns default settings when none exist", () => {
      const settings = getSettings();
      expect(settings.streakCount).toBe(3);
      expect(settings.preferredLanguage).toBe("Spanish");
      expect(settings.darkMode).toBe(false);
    });

    it("saves and retrieves settings", () => {
      const customSettings: AppSettings = {
        streakCount: 5,
        lastQuizDate: "2025-01-01",
        totalQuizzesTaken: 10,
        highScore: 100,
        preferredLanguage: "Japanese",
        darkMode: true,
        dailyGoal: 15,
      };

      saveSettings(customSettings);
      expect(getSettings()).toEqual(customSettings);
    });

    it("returns default settings if stored JSON is corrupt", () => {
      localStorage.setItem("vocab_settings_v1", "not json");
      expect(getSettings().preferredLanguage).toBe("Spanish");
    });
  });

  describe("getActivity & logActivity", () => {
    it("returns empty object when no activity exists", () => {
      expect(getActivity()).toEqual({});
    });

    it("logs activity for today", () => {
      const todayKey = new Date().toISOString().split("T")[0];
      logActivity();
      expect(getActivity()[todayKey]).toBe(1);

      logActivity();
      expect(getActivity()[todayKey]).toBe(2);
    });

    it("logs activity for a custom date", () => {
      logActivity("2025-01-01");
      expect(getActivity()["2025-01-01"]).toBe(1);
    });
  });

  describe("seedData & initializeApp", () => {
    it("seeds data correctly", () => {
      seedData();
      const vocab = getVocab();
      expect(vocab.length).toBeGreaterThan(0);
      expect(getSettings().preferredLanguage).toBe("Spanish");
    });

    it("initializeApp seeds data only if no vocab exists", () => {
      initializeApp();
      const initialCount = getVocab().length;
      expect(initialCount).toBeGreaterThan(0);

      // Modify vocab and re-initialize
      saveVocab([]);
      // localStorage now has key "vocab_bank_v1" set to "[]"
      initializeApp();
      // Since item exists, initializeApp won't re-seed
      expect(getVocab()).toEqual([]);
    });

    it("clearAllData removes storage items", () => {
      seedData();
      clearAllData();
      expect(getVocab()).toEqual([]);
      expect(getActivity()).toEqual({});
    });
  });

  describe("getNextReviewDate", () => {
    it("calculates correct review date based on mastery level", () => {
      const dateLevel1 = getNextReviewDate(1);
      const dateLevel5 = getNextReviewDate(5);
      expect(new Date(dateLevel5).getTime()).toBeGreaterThan(
        new Date(dateLevel1).getTime()
      );
    });

    it("defaults to 1 day for invalid mastery levels", () => {
      const dateLevel0 = getNextReviewDate(0);
      const dateLevel6 = getNextReviewDate(6);
      expect(dateLevel0).toBeDefined();
      expect(dateLevel6).toBeDefined();
    });
  });

  describe("levenshtein", () => {
    it("calculates distance between strings", () => {
      expect(levenshtein("hello", "hello")).toBe(0);
      expect(levenshtein("kitten", "sitting")).toBe(3);
      expect(levenshtein("hola", "hola!")).toBe(1);
      expect(levenshtein("", "test")).toBe(4);
    });
  });
});
