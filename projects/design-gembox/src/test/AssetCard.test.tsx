import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AssetCard } from "../components/AssetCard";
import { Asset } from "../types/asset";

describe("AssetCard accessibility", () => {
  const dummyFontAsset: Asset = {
    id: "1",
    name: "Inter Font",
    type: "font",
    project: "Design System",
    tags: ["typography"],
    createdAt: "2023-01-01",
    fontFamily: "Inter",
    fontWeights: ["400", "700"],
  };

  it("renders accessible ARIA labels for edit and delete buttons in font card", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <AssetCard
        asset={dummyFontAsset}
        viewMode="grid"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByRole("button", { name: "Edit Inter Font" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Inter Font" })).toBeInTheDocument();
  });
});
