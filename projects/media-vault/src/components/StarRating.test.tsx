import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("renders readonly rating with container img role and label", () => {
    render(<StarRating rating={8} max={10} />);
    const container = screen.getByRole("img", { name: "8 of 10 stars" });
    expect(container).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
    expect(buttons[0]).toBeDisabled();
    expect(buttons[0]).toHaveAttribute("aria-label", "1 out of 5 stars");
  });

  it("renders interactive rating with aria-pressed and calls onChange on click", () => {
    const handleChange = vi.fn();
    render(<StarRating rating={6} interactive onChange={handleChange} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true"); // Math.round(6/2) = 3 -> index 2

    fireEvent.click(buttons[3]); // 4 stars = 8 points
    expect(handleChange).toHaveBeenCalledWith(8);
  });
});
