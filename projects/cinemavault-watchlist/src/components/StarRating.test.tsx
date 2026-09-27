import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating component", () => {
  it("renders 10 rating buttons with proper aria-labels", () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(10);
    expect(buttons[0]).toHaveAttribute("aria-label", "Rate 1 out of 10 stars");
    expect(buttons[2]).toHaveAttribute("aria-label", "Rate 3 out of 10 stars");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[3]).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onRate callback when a star is clicked", () => {
    const handleRate = vi.fn();
    render(<StarRating rating={0} onRate={handleRate} />);
    const star5 = screen.getByRole("button", { name: "Rate 5 out of 10 stars" });
    fireEvent.click(star5);
    expect(handleRate).toHaveBeenCalledWith(5);
  });

  it("handles readonly mode properly with disabled buttons and img container role", () => {
    render(<StarRating rating={7} readonly />);
    const container = screen.getByRole("img", { name: "7 of 10 stars" });
    expect(container).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[6]).toHaveAttribute("aria-label", "7 of 10 stars");
  });
});
