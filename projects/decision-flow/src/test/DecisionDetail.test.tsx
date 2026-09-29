import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DecisionDetail from "../pages/DecisionDetail";
import { Decision } from "../types/decision";

const pendingDecision: Decision = {
  id: "test-pending",
  title: "Pending Decision Test",
  category: "Technology",
  dateCreated: "2026-03-01T00:00:00.000Z",
  deadline: null,
  status: "pending",
  options: [{ id: "opt-1", text: "Opt 1", pros: [], cons: [] }],
  chosenOption: null,
  reasoning: "",
  expectedOutcome: "",
  confidenceScore: 5,
  actualOutcome: null,
  actualOutcomeDate: null,
  reflectionNotes: null,
  qualityScore: null,
  biasTags: [],
  isTrashed: false,
};

const decidedDecision: Decision = {
  id: "test-decided",
  title: "Decided Decision Test",
  category: "Career",
  dateCreated: "2026-03-01T00:00:00.000Z",
  deadline: null,
  status: "decided",
  options: [{ id: "opt-1", text: "Opt 1", pros: [], cons: [] }],
  chosenOption: "opt-1",
  reasoning: "Reasoning test",
  expectedOutcome: "Expected test",
  confidenceScore: 7,
  actualOutcome: null,
  actualOutcomeDate: null,
  reflectionNotes: null,
  qualityScore: null,
  biasTags: [],
  isTrashed: false,
};

describe("DecisionDetail Quality Score Rating", () => {
  it("disables outcome tab when status is pending", () => {
    render(
      <MemoryRouter initialEntries={["/decision/test-pending"]}>
        <Routes>
          <Route
            path="/decision/:id"
            element={
              <DecisionDetail
                decisions={[pendingDecision]}
                onUpdate={vi.fn()}
                onTrash={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    const outcomeTab = screen.getByRole("tab", { name: /outcome & reflection/i });
    expect(outcomeTab).toBeDisabled();
  });

  it("renders rating group with accessible buttons and handles rating selection when outcome tab is selected", () => {
    render(
      <MemoryRouter initialEntries={["/decision/test-decided"]}>
        <Routes>
          <Route
            path="/decision/:id"
            element={
              <DecisionDetail
                decisions={[decidedDecision]}
                onUpdate={vi.fn()}
                onTrash={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Switch to Outcome tab using keyboard/click sequence for Radix Tabs
    const outcomeTab = screen.getByRole("tab", { name: /outcome & reflection/i });
    expect(outcomeTab).not.toBeDisabled();
    fireEvent.keyDown(outcomeTab, { key: "Enter", code: "Enter" });
    fireEvent.click(outcomeTab);

    // Verify rating group exists
    const ratingGroup = screen.getByRole("group", { name: /quality score/i });
    expect(ratingGroup).toBeInTheDocument();

    // Verify star rating buttons have proper ARIA attributes
    const star4 = screen.getByRole("button", { name: /rate 4 out of 5 stars/i });
    expect(star4).toHaveAttribute("aria-pressed", "false");

    // Click 4th star
    fireEvent.click(star4);

    // Now 4th star should be pressed
    expect(star4).toHaveAttribute("aria-pressed", "true");
  });
});
