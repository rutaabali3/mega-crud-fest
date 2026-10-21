import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import WIPBoard from "@/pages/WIPBoard";
import { CraftProvider } from "@/context/CraftContext";
import { MemoryRouter } from "react-router-dom";

const initialProjects = [
  {
    id: "1",
    title: "Crochet Scarf",
    type: "crochet",
    status: "wip",
    progress: 50,
    materials: [],
    sessions: [],
    totalHoursSpent: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Knitted Sweater",
    type: "knitting",
    status: "wip",
    progress: 10,
    materials: [],
    sessions: [],
    totalHoursSpent: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("WIPBoard Filter Accessibility", () => {
  beforeEach(() => {
    localStorage.setItem("craft_projects", JSON.stringify(initialProjects));
  });

  it("renders filter badges with correct ARIA roles and pressed states", () => {
    render(
      <MemoryRouter>
        <CraftProvider>
          <WIPBoard />
        </CraftProvider>
      </MemoryRouter>
    );

    const allFilter = screen.getByRole("button", { name: /filter by all types/i });
    const crochetFilter = screen.getByRole("button", { name: /filter by crochet/i });

    expect(allFilter).toHaveAttribute("aria-pressed", "true");
    expect(crochetFilter).toHaveAttribute("aria-pressed", "false");
    expect(allFilter).toHaveAttribute("tabindex", "0");
  });

  it("updates filter state on keyboard Enter and Space events", () => {
    render(
      <MemoryRouter>
        <CraftProvider>
          <WIPBoard />
        </CraftProvider>
      </MemoryRouter>
    );

    const crochetFilter = screen.getByRole("button", { name: /filter by crochet/i });
    const allFilter = screen.getByRole("button", { name: /filter by all types/i });

    // Press Enter to select Crochet filter
    fireEvent.keyDown(crochetFilter, { key: "Enter" });
    expect(crochetFilter).toHaveAttribute("aria-pressed", "true");
    expect(allFilter).toHaveAttribute("aria-pressed", "false");

    // Press Space to select All filter
    fireEvent.keyDown(allFilter, { key: " " });
    expect(allFilter).toHaveAttribute("aria-pressed", "true");
    expect(crochetFilter).toHaveAttribute("aria-pressed", "false");
  });
});
