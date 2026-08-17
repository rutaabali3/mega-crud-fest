import { useState, useMemo } from "react";
import { useContacts } from "@/hooks/useContacts";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Contact } from "@/types/contact";
import { ContactCard } from "@/components/ContactCard";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Moon, Sun, Download, Upload, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SortMode = "name" | "birthday";

export default function Index() {
  const { contacts, addContact, updateContact, deleteContact, importContacts, allTags } = useContacts();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    let list = contacts;
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (tagFilter) {
      list = list.filter((c) => c.tags.includes(tagFilter));
    }

    if (sortMode === "birthday") {
      const today = new Date();
      const todayDOY = today.getMonth() * 31 + today.getDate();
      list = [...list].sort((a, b) => {
        if (!a.birthday && !b.birthday) return a.name.localeCompare(b.name);
        if (!a.birthday) return 1;
        if (!b.birthday) return -1;
        const [, am, ad] = a.birthday.split("-").map(Number);
        const [, bm, bd] = b.birthday.split("-").map(Number);
        const aDOY = ((am * 31 + ad - todayDOY + 372) % 372);
        const bDOY = ((bm * 31 + bd - todayDOY + 372) % 372);
        return aDOY - bDOY;
      });
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [contacts, search, tagFilter, sortMode]);

  const grouped = useMemo(() => {
    if (sortMode !== "name") return null;
    const groups: Record<string, Contact[]> = {};
    for (const c of filtered) {
      const letter = c.name[0]?.toUpperCase() || "#";
      (groups[letter] ??= []).push(c);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, sortMode]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "local-contacts.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Contacts exported" });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        importContacts(data);
        toast({ title: `Imported ${data.length} contacts` });
      } catch {
        toast({ title: "Invalid JSON file", variant: "destructive" });
      }
    };
    input.click();
  };

  const handleSave = (data: Omit<Contact, "id">) => {
    if (editingContact) {
      updateContact(editingContact.id, data);
    } else {
      addContact(data);
    }
    setEditingContact(null);
  };

  const handleConfirmDelete = () => {
    if (deletingContact) {
      deleteContact(deletingContact.id);
      toast({ title: `${deletingContact.name} deleted` });
      setDeletingContact(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Local Contacts</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleImport} title="Import">
              <Upload className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExport} title="Export">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDark} title="Toggle dark mode">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <BirthdayBanner contacts={contacts} />

        {contacts.length === 0 ? (
          <EmptyState onAdd={() => setFormOpen(true)} />
        ) : (
          <>
            {/* Search & Controls */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => setSortMode((m) => (m === "name" ? "birthday" : "name"))}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortMode === "name" ? "A–Z" : "Birthday"}
              </Button>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge
                  variant={tagFilter === null ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setTagFilter(null)}
                >
                  All
                </Badge>
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tagFilter === tag ? "default" : "outline"}
                    className="cursor-pointer text-xs capitalize"
                    onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Contact List */}
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No contacts match your search.</p>
            ) : grouped ? (
              grouped.map(([letter, group]) => (
                <div key={letter} className="mb-4">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">{letter}</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.map((c) => (
                      <ContactCard
                        key={c.id}
                        contact={c}
                        onEdit={(c) => { setEditingContact(c); setFormOpen(true); }}
                        onDelete={setDeletingContact}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filtered.map((c) => (
                  <ContactCard
                    key={c.id}
                    contact={c}
                    onEdit={(c) => { setEditingContact(c); setFormOpen(true); }}
                    onDelete={setDeletingContact}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => { setEditingContact(null); setFormOpen(true); }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Form Dialog */}
      <ContactFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingContact(null); }}
        onSave={handleSave}
        existingTags={allTags}
        editContact={editingContact}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingContact} onOpenChange={(v) => !v && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingContact?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this contact. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
