import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ProjectCard } from "@/components/ProjectCard";
import type { CraftProject } from "@/types/craft";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProjectCard component accessibility", () => {
  const mockProject: CraftProject = {
    id: "proj-1",
    title: "Handmade Scarf",
    type: "knitting",
    status: "wip",
    progress: 45,
    totalHoursSpent: 3.5,
    createdAt: new Date().toISOString(),
  };

  it("renders with appropriate ARIA roles, labels, and keyboard handlers", () => {
    render(
      <MemoryRouter>
        <ProjectCard
          project={mockProject}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
          onLogSession={vi.fn()}
        />
      </MemoryRouter>
    );

    const card = screen.getByRole("button", { name: /view project details for handmade scarf/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("tabindex", "0");

    const optionsBtn = screen.getByRole("button", { name: /project options for handmade scarf/i });
    expect(optionsBtn).toBeInTheDocument();

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "45");

    // Test keyboard activation on card
    fireEvent.keyDown(card, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("/project/proj-1");
  });
});
