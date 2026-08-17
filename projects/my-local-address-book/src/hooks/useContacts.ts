import { useState, useEffect, useCallback } from "react";
import { Contact } from "@/types/contact";

const STORAGE_KEY = "local-contacts-data";

const SAMPLE_CONTACTS: Contact[] = [
  {
    id: "sample-1",
    name: "Alice Johnson",
    phone: "+1 (555) 123-4567",
    email: "alice.johnson@email.com",
    birthday: "1992-03-08",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    tags: ["family", "friends"],
  },
  {
    id: "sample-2",
    name: "Bob Martinez",
    phone: "+1 (555) 987-6543",
    email: "bob.martinez@work.com",
    birthday: "1988-07-22",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tags: ["work"],
  },
  {
    id: "sample-3",
    name: "Clara Chen",
    phone: "+1 (555) 456-7890",
    email: "clara.chen@email.com",
    birthday: "1995-12-15",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    tags: ["friends"],
  },
  {
    id: "sample-4",
    name: "David Okafor",
    phone: "+1 (555) 321-0987",
    email: "david.o@startup.io",
    birthday: "1990-01-30",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    tags: ["work", "friends"],
  },
  {
    id: "sample-5",
    name: "Elena Rossi",
    phone: "+1 (555) 654-3210",
    email: "elena.rossi@email.com",
    birthday: "1993-09-05",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    tags: ["family"],
  },
];

function loadContacts(): Contact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_CONTACTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SAMPLE_CONTACTS;
    return parsed;
  } catch {
    return SAMPLE_CONTACTS;
  }
}

function saveContacts(contacts: Contact[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(loadContacts);

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  const addContact = useCallback((contact: Omit<Contact, "id">) => {
    const newContact: Contact = { ...contact, id: crypto.randomUUID() };
    setContacts((prev) => [...prev, newContact]);
    return newContact;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Omit<Contact, "id">>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const importContacts = useCallback((imported: Contact[]) => {
    setContacts((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const newOnes = imported.filter((c) => !existingIds.has(c.id));
      return [...prev, ...newOnes];
    });
  }, []);

  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags))).sort();

  return { contacts, addContact, updateContact, deleteContact, importContacts, allTags };
}
