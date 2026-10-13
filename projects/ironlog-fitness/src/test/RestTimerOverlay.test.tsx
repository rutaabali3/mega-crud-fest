import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkoutProvider, useWorkout } from "@/context/WorkoutContext";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";

function TestComponent() {
  const { startRestTimer } = useWorkout();
  return (
    <div>
      <button onClick={() => startRestTimer(90)}>Start 90s Timer</button>
      <RestTimerOverlay />
    </div>
  );
}

describe("RestTimerOverlay Accessibility", () => {
  it("renders progressbar role and accessibility labels when timer is active", () => {
    render(
      <WorkoutProvider>
        <TestComponent />
      </WorkoutProvider>
    );

    // Overlay is hidden initially
    expect(screen.queryByRole("progressbar")).toBeNull();

    // Trigger start rest timer
    fireEvent.click(screen.getByText("Start 90s Timer"));

    // Check progressbar SVG
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-label", "Rest timer progress");
    expect(progressbar).toHaveAttribute("aria-valuenow", "90");
    expect(progressbar).toHaveAttribute("aria-valuemax", "90");
    expect(progressbar).toHaveAttribute("aria-valuetext", "1 minutes 30 seconds remaining");

    // Check action buttons
    expect(screen.getByRole("button", { name: "Pause rest timer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip rest timer" })).toBeInTheDocument();

    // Check preset buttons
    expect(screen.getByRole("button", { name: "Set rest timer to 30 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Set rest timer to 1.5 minutes" })).toBeInTheDocument();

    // Toggle pause/resume
    fireEvent.click(screen.getByRole("button", { name: "Pause rest timer" }));
    expect(screen.getByRole("button", { name: "Resume rest timer" })).toBeInTheDocument();
  });
});
