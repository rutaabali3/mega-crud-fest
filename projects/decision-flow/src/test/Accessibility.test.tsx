import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AllDecisions from "../pages/AllDecisions";
import CreateDecision from "../pages/CreateDecision";
import { Decision } from "../types/decision";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("Accessibility Enhancements in Decision Flow", () => {
  it("renders filter toggle button in AllDecisions with aria-label", () => {
    const mockDecisions: Decision[] = [
      {
        id: "1",
        title: "Test Decision",
        category: "Career",
        dateCreated: new Date().toISOString(),
        deadline: null,
        status: "pending",
        options: [],
        chosenOption: null,
        reasoning: "Reasoning",
        expectedOutcome: "Outcome",
        confidenceScore: 7,
        actualOutcome: null,
        actualOutcomeDate: null,
        reflectionNotes: null,
        qualityScore: null,
        biasTags: [],
        isTrashed: false,
      },
    ];

    render(
      <MemoryRouter>
        <AllDecisions
          decisions={mockDecisions}
          settings={{ showConfidence: true, showBiasTags: true }}
        />
      </MemoryRouter>
    );

    const filterButton = screen.getByRole("button", { name: "Filter decisions" });
    expect(filterButton).toBeInTheDocument();
  });

  it("renders remove option button in CreateDecision with aria-label when > 2 options exist", () => {
    render(
      <MemoryRouter>
        <CreateDecision onSave={vi.fn()} />
      </MemoryRouter>
    );

    // Navigate to step 1 (Options)
    const nextButton = screen.getByRole("button", { name: /Next/i });
    // Title is empty initially; fill in title first
    const titleInput = screen.getByPlaceholderText("What are you deciding?");
    fireEvent.change(titleInput, { target: { value: "New Decision Title" } });

    fireEvent.click(nextButton);

    // Add 3rd option
    const addOptionButton = screen.getByRole("button", { name: /Add Option/i });
    fireEvent.click(addOptionButton);

    // Verify remove option button has aria-label
    const removeButtons = screen.getAllByRole("button", { name: "Remove option" });
    expect(removeButtons.length).toBeGreaterThan(0);
  });
});
