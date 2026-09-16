import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  it("renders with radiogroup role and aria-labels when interactive", () => {
    render(<StarRating rating={3} />);

    const group = screen.getByRole("radiogroup", { name: "Rating" });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(10);
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(radios[3]).toHaveAttribute("aria-checked", "false");
    expect(radios[0]).toHaveAttribute("aria-label", "Rate 1 out of 10 stars");
  });

  it("calls onRate when a star button is clicked", () => {
    const handleRate = vi.fn();
    render(<StarRating rating={3} onRate={handleRate} />);

    const star7 = screen.getByRole("radio", { name: "Rate 7 out of 10 stars" });
    fireEvent.click(star7);

    expect(handleRate).toHaveBeenCalledWith(7);
  });

  it("renders as image role with rating description when readonly", () => {
    render(<StarRating rating={8} readonly />);

    const img = screen.getByRole("img", { name: "Rating: 8 out of 10 stars" });
    expect(img).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });
});
