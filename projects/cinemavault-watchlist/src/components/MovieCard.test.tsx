import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MovieCard } from "./MovieCard";
import type { CinemaItem } from "@/types/cinema";

const sampleItem: CinemaItem = {
  id: "1",
  title: "Inception",
  type: "Movie",
  status: "To Watch",
  genre: "Sci-Fi",
  year: 2010,
  personalRating: 9,
  posterUrl: "",
  notes: "Great movie",
  createdAt: "2026-01-01",
};

describe("MovieCard component", () => {
  it("renders with button role, tabIndex, and aria-label", () => {
    const handleClick = vi.fn();
    render(<MovieCard item={sampleItem} onClick={handleClick} />);

    const cardButton = screen.getByRole("button", { name: "View details for Inception" });
    expect(cardButton).toBeInTheDocument();
    expect(cardButton).toHaveAttribute("tabindex", "0");
  });

  it("triggers onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<MovieCard item={sampleItem} onClick={handleClick} />);

    const cardButton = screen.getByRole("button", { name: "View details for Inception" });
    fireEvent.click(cardButton);
    expect(handleClick).toHaveBeenCalledWith(sampleItem);
  });

  it("triggers onClick on Enter and Space key presses", () => {
    const handleClick = vi.fn();
    render(<MovieCard item={sampleItem} onClick={handleClick} />);

    const cardButton = screen.getByRole("button", { name: "View details for Inception" });

    fireEvent.keyDown(cardButton, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(cardButton, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(cardButton, { key: "A" });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
