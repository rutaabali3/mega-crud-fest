import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AssetModal } from "../components/AssetModal";
import { Asset } from "../types/asset";

const dummyColorAsset: Asset = {
  id: "1",
  name: "Brand Colors",
  type: "color",
  project: "Core App",
  tags: ["brand", "v1"],
  hexValues: ["#123456", "#654321"],
};

describe("AssetModal accessibility and interaction", () => {
  it("renders tag remove buttons with explicit aria-labels and removes tags when clicked", () => {
    render(
      <AssetModal
        open={true}
        onClose={() => {}}
        onSave={() => {}}
        editingAsset={dummyColorAsset}
        existingProjects={["Core App"]}
      />
    );

    const removeTagBrandBtn = screen.getByRole("button", { name: "Remove tag brand" });
    expect(removeTagBrandBtn).toBeInTheDocument();

    fireEvent.click(removeTagBrandBtn);
    expect(screen.queryByRole("button", { name: "Remove tag brand" })).not.toBeInTheDocument();
  });

  it("renders color remove buttons with explicit aria-labels and removes color when clicked", () => {
    render(
      <AssetModal
        open={true}
        onClose={() => {}}
        onSave={() => {}}
        editingAsset={dummyColorAsset}
        existingProjects={["Core App"]}
      />
    );

    const removeColorBtn = screen.getByRole("button", { name: "Remove color #123456" });
    expect(removeColorBtn).toBeInTheDocument();

    fireEvent.click(removeColorBtn);
    expect(screen.queryByRole("button", { name: "Remove color #123456" })).not.toBeInTheDocument();
  });
});
