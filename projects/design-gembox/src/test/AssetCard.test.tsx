import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AssetCard } from "../components/AssetCard";
import { Asset } from "../types/asset";

const dummyColorAsset: Asset = {
  id: "1",
  name: "Brand Palette",
  type: "color",
  project: "Core App",
  tags: ["ui", "theme"],
  hexValues: ["#FF0000", "#00FF00"],
};

const dummyFontAsset: Asset = {
  id: "2",
  name: "Roboto Sans",
  type: "font",
  project: "Core App",
  tags: ["typography"],
  fontFamily: "Roboto, sans-serif",
  fontWeights: ["400", "700"],
};

const dummyIconAsset: Asset = {
  id: "3",
  name: "Home Icon",
  type: "icon",
  project: "Core App",
  tags: ["iconography"],
  iconSvg: "<svg viewBox='0 0 24 24'><path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'/></svg>",
};

const dummyImageAsset: Asset = {
  id: "4",
  name: "Hero Banner",
  type: "image",
  project: "Core App",
  tags: ["banner"],
  imageUrl: "https://example.com/banner.jpg",
};

const maliciousImageAsset: Asset = {
  id: "5",
  name: "Malicious Image",
  type: "image",
  project: "Core App",
  tags: ["banner"],
  imageUrl: "javascript:alert('XSS')",
};

describe("AssetCard accessibility and labels", () => {
  it("renders color card with accessible swatches and action buttons", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <AssetCard
        asset={dummyColorAsset}
        viewMode="grid"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    expect(screen.getByRole("button", { name: "Copy color #FF0000" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy color #00FF00" })).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: "Edit Brand Palette" });
    const deleteButton = screen.getByRole("button", { name: "Delete Brand Palette" });

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it("renders font card with accessible edit/delete action buttons", () => {
    render(
      <AssetCard
        asset={dummyFontAsset}
        viewMode="grid"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Edit Roboto Sans" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Roboto Sans" })).toBeInTheDocument();
  });

  it("renders icon card with accessible copy SVG, edit, and delete buttons", () => {
    render(
      <AssetCard
        asset={dummyIconAsset}
        viewMode="grid"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Copy SVG code for Home Icon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Home Icon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Home Icon" })).toBeInTheDocument();
  });

  it("renders image card with safe href for legitimate image URL", () => {
    render(
      <AssetCard
        asset={dummyImageAsset}
        viewMode="grid"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    const link = screen.getByRole("link", { name: "Open full image for Hero Banner" });
    expect(link).toHaveAttribute("href", "https://example.com/banner.jpg");
  });

  it("sanitizes malicious javascript: URL in image card href", () => {
    render(
      <AssetCard
        asset={maliciousImageAsset}
        viewMode="grid"
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );

    const link = screen.getByRole("link", { name: "Open full image for Malicious Image" });
    expect(link).not.toHaveAttribute("href", "javascript:alert('XSS')");
    expect(link).toHaveAttribute("href", "#");
  });
});
