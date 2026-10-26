import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ContactCard } from "../components/ContactCard";
import { Contact } from "../types/contact";

const mockContact: Contact = {
  id: "1",
  name: "Jane Doe",
  phone: "555-1234",
  email: "jane@example.com",
  birthday: "1990-01-01",
  photoUrl: "",
  tags: ["family"],
};

describe("ContactCard", () => {
  it("renders edit and delete buttons with accessible aria-labels", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <ContactCard
        contact={mockContact}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    const editButton = screen.getByRole("button", { name: "Edit Jane Doe" });
    const deleteButton = screen.getByRole("button", { name: "Delete Jane Doe" });

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });
});
