import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating Component", () => {
  it("renders non-interactive star rating with img role and composite label", () => {
    render(<StarRating rating={8} max={10} />);

    const container = screen.getByRole("img", { name: "8 of 10 stars" });
    expect(container).toBeInTheDocument();

    const starButtons = screen.getAllByRole("button", { hidden: true });
    expect(starButtons.length).toBe(5);
    expect(starButtons[0]).toBeDisabled();
    expect(starButtons[0]).toHaveAttribute("tabindex", "-1");
  });

  it("renders interactive star rating with aria-label, aria-pressed, and click handler", () => {
    const handleChange = vi.fn();
    render(<StarRating rating={6} max={10} interactive onChange={handleChange} />);

    const starButton6 = screen.getByRole("button", { name: "Rate 6 out of 10 stars" });
    expect(starButton6).not.toBeDisabled();
    expect(starButton6).toHaveAttribute("aria-pressed", "true");

    const starButton10 = screen.getByRole("button", { name: "Rate 10 out of 10 stars" });
    expect(starButton10).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(starButton10);
    expect(handleChange).toHaveBeenCalledWith(10);
  });
});
