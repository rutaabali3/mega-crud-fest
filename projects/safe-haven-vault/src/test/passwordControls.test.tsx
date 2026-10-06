import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import PasswordGenerator from "../components/PasswordGenerator";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe("PasswordGenerator Accessibility", () => {
  it("renders close button with correct ARIA label", () => {
    const handleClose = vi.fn();
    render(<PasswordGenerator onUse={() => {}} onClose={handleClose} />);

    const closeBtn = screen.getByRole("button", { name: "Close password generator" });
    expect(closeBtn).toBeInTheDocument();
  });
});
