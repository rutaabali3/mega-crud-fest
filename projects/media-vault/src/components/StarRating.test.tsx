import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./StarRating";

describe("StarRating component", () => {
  it("renders in readonly mode with role='img' and composite aria-label", () => {
    render(<StarRating rating={8} max={10} />);

    const container = screen.getByRole("img", { name: "8 of 10 stars" });
    expect(container).toBeInTheDocument();

    const starButtons = screen.getAllByRole("button", { hidden: true });
    expect(starButtons).toHaveLength(5);
    expect(starButtons[0]).toBeDisabled();
    expect(starButtons[0]).toHaveAttribute("aria-label", "2 of 10 stars");
  });

  it("renders in interactive mode with interactive aria-labels and handles click events", () => {
    const handleRate = vi.fn();
    render(<StarRating rating={6} max={10} interactive onChange={handleRate} />);

    const starButtons = screen.getAllByRole("button");
    expect(starButtons).toHaveLength(5);

    // Star 3 corresponds to rating 6
    expect(starButtons[2]).toHaveAttribute("aria-label", "Rate 6 out of 10 stars");
    expect(starButtons[2]).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(starButtons[4]); // 10 stars
    expect(handleRate).toHaveBeenCalledWith(10);
  });
});
