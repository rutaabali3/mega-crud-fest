import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HabitCard } from "./HabitCard";
import { Habit } from "@/types/habit";

const mockHabit: Habit = {
  id: "habit-1",
  name: "Daily Meditation",
  frequency: "daily",
  targetStreak: 30,
  color: "#58a6ff",
  completions: [],
};

describe("HabitCard", () => {
  it("renders habit details and accessible action buttons with aria-labels", () => {
    const onEdit = vi.fn();
    const onArchive = vi.fn();
    const onClick = vi.fn();

    render(
      <HabitCard
        habit={mockHabit}
        isActive={false}
        onClick={onClick}
        onEdit={onEdit}
        onArchive={onArchive}
      />
    );

    expect(screen.getByText("Daily Meditation")).toBeInTheDocument();

    const editBtn = screen.getByRole("button", { name: "Edit Daily Meditation" });
    const archiveBtn = screen.getByRole("button", { name: "Archive Daily Meditation" });

    expect(editBtn).toBeInTheDocument();
    expect(archiveBtn).toBeInTheDocument();

    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(archiveBtn);
    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it("handles keyboard selection with Enter and Space keys", () => {
    const onClick = vi.fn();

    render(
      <HabitCard
        habit={mockHabit}
        isActive={true}
        onClick={onClick}
        onEdit={() => {}}
        onArchive={() => {}}
      />
    );

    const card = screen.getByRole("button", { pressed: true });
    expect(card).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
