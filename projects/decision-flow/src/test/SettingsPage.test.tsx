import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import SettingsPage from "../pages/SettingsPage";
import { toast } from "sonner";
import { SEED_DECISIONS } from "../data/seedData";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("SettingsPage import validation", () => {
  const defaultProps = {
    settings: { darkMode: false, showConfidence: true, showBiasTags: true },
    onUpdateSettings: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    onClearAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully imports valid decision JSON data", async () => {
    const { container } = render(<SettingsPage {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const validData = JSON.stringify(SEED_DECISIONS);
    const file = new File([validData], "decisions.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(defaultProps.onImport).toHaveBeenCalledWith(SEED_DECISIONS, "merge");
      expect(toast.success).toHaveBeenCalledWith("Imported 3 decisions (merge)");
    });
  });

  it("rejects invalid JSON string", async () => {
    const { container } = render(<SettingsPage {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidJson = "{ invalid json content ";
    const file = new File([invalidJson], "invalid.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid JSON file");
      expect(defaultProps.onImport).not.toHaveBeenCalled();
    });
  });

  it("rejects JSON that does not conform to Decision schema", async () => {
    const { container } = render(<SettingsPage {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidSchemaData = JSON.stringify([
      {
        id: "1",
        title: "Incomplete decision",
        // missing required fields like category, options, biasTags, etc.
      },
    ]);
    const file = new File([invalidSchemaData], "malformed.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid decision data format");
      expect(defaultProps.onImport).not.toHaveBeenCalled();
    });
  });

  it("rejects non-array JSON payload", async () => {
    const { container } = render(<SettingsPage {...defaultProps} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const objectData = JSON.stringify({ key: "value" });
    const file = new File([objectData], "object.json", { type: "application/json" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid decision data format");
      expect(defaultProps.onImport).not.toHaveBeenCalled();
    });
  });
});
