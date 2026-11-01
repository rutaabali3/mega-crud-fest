import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "../components/Navbar";

describe("Navbar accessibility and interactive controls", () => {
  const defaultProps = {
    search: "",
    onSearchChange: vi.fn(),
    viewMode: "grid" as const,
    onViewModeChange: vi.fn(),
    onAddAsset: vi.fn(),
    onPalettePreview: vi.fn(),
    dark: false,
    onToggleTheme: vi.fn(),
    onToggleSidebar: vi.fn(),
  };

  it("renders icon buttons with accessible aria labels in grid and light mode", () => {
    render(<Navbar {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Toggle navigation menu" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search assets" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Palette Preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to list view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add asset/i })).toBeInTheDocument();
  });

  it("updates aria-label dynamically when in list mode and dark mode", () => {
    render(<Navbar {...defaultProps} viewMode="list" dark={true} />);

    expect(screen.getByRole("button", { name: "Switch to grid view" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("triggers callback when action buttons are clicked", () => {
    render(<Navbar {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    expect(defaultProps.onToggleSidebar).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Palette Preview" }));
    expect(defaultProps.onPalettePreview).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Switch to list view" }));
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith("list");

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(defaultProps.onToggleTheme).toHaveBeenCalled();
  });
});
