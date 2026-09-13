import "./setup";
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCinemaVault } from "../hooks/useCinemaVault";
import type { CinemaItem } from "../types/cinema";

describe("useCinemaVault - importData", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("should return false and not crash when given invalid JSON string", () => {
    const { result } = renderHook(() => useCinemaVault());

    let success: boolean | undefined;
    act(() => {
      success = result.current.importData("invalid json string {{{");
    });

    expect(success).toBe(false);
  });

  it("should return false when given a JSON string that is not an array", () => {
    const { result } = renderHook(() => useCinemaVault());

    let successObject: boolean | undefined;
    let successNumber: boolean | undefined;
    let successBoolean: boolean | undefined;

    act(() => {
      successObject = result.current.importData(JSON.stringify({ title: "Inception" }));
      successNumber = result.current.importData(JSON.stringify(12345));
      successBoolean = result.current.importData(JSON.stringify(true));
    });

    expect(successObject).toBe(false);
    expect(successNumber).toBe(false);
    expect(successBoolean).toBe(false);
  });

  it("should return true and update items state when given a valid JSON array", () => {
    const { result } = renderHook(() => useCinemaVault());

    const mockItems: CinemaItem[] = [
      {
        id: "item-1",
        title: "Interstellar",
        type: "Movie",
        genre: "Sci-Fi",
        status: "Watched",
        personalRating: 5,
        notes: "Great movie",
        addedDate: "2023-01-01T00:00:00.000Z",
      },
    ];

    let success: boolean | undefined;
    act(() => {
      success = result.current.importData(JSON.stringify(mockItems));
    });

    expect(success).toBe(true);
    expect(result.current.items).toEqual(mockItems);
  });
});
