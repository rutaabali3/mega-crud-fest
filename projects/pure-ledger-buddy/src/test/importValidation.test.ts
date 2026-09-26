import { describe, it, expect } from "vitest";
import { transactionsImportSchema } from "../types/transaction";

describe("transactionsImportSchema", () => {
  it("validates valid array of transactions", () => {
    const validData = [
      {
        id: "1",
        type: "income",
        amount: 100,
        category: "Salary",
        date: "2025-01-01",
        note: "Monthly salary",
      },
      {
        id: "2",
        type: "expense",
        amount: 50.5,
        category: "Food",
        date: "2025-01-02",
        note: "Groceries",
      },
    ];

    const result = transactionsImportSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe("1");
    }
  });

  it("rejects non-array JSON inputs", () => {
    const invalidData = {
      id: "1",
      type: "income",
      amount: 100,
      category: "Salary",
      date: "2025-01-01",
      note: "Monthly salary",
    };

    const result = transactionsImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects invalid transaction type", () => {
    const invalidData = [
      {
        id: "1",
        type: "transfer", // invalid enum value
        amount: 100,
        category: "Salary",
        date: "2025-01-01",
        note: "Test",
      },
    ];

    const result = transactionsImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects missing fields or wrong field types", () => {
    const invalidData = [
      {
        id: "1",
        type: "income",
        amount: "100", // string instead of number
        category: "Salary",
        date: "2025-01-01",
        note: "Test",
      },
    ];

    const result = transactionsImportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
