import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ItemCard } from "@/components/ItemCard";
import type { WishItem } from "@/types/wishlist";

describe("ItemCard component security", () => {
  const mockItem: WishItem = {
    id: "1",
    name: "Test Gift Item",
    url: "https://example.com/gift",
    price: 50,
    currency: "USD",
    priority: "medium",
    forPerson: "Alice",
    occasion: "Birthday",
    notes: "A nice gift",
    claimed: false,
    purchased: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("renders external links with target='_blank' and rel='noopener noreferrer'", () => {
    render(<ItemCard item={mockItem} viewMode="grid" />);

    const link = screen.getByRole("link", { name: /open link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render link for dangerous javascript: URIs", () => {
    const maliciousItem: WishItem = {
      ...mockItem,
      url: "javascript:alert('xss')",
    };
    render(<ItemCard item={maliciousItem} viewMode="grid" />);

    const link = screen.queryByRole("link", { name: /open link/i });
    expect(link).not.toBeInTheDocument();
  });

  it("does not render link for invalid or dangerous data: URIs", () => {
    const maliciousItem: WishItem = {
      ...mockItem,
      url: "data:text/html,<script>alert(1)</script>",
    };
    render(<ItemCard item={maliciousItem} viewMode="grid" />);

    const link = screen.queryByRole("link", { name: /open link/i });
    expect(link).not.toBeInTheDocument();
  });
});
