import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Download, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NotesSidebar } from "@/components/NotesSidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { EmptyState } from "@/components/EmptyState";
import { useNotes } from "@/hooks/useNotes";

export default function Index() {
  const {
    activeNotes, trashedNotes,
    createNote, updateNote, softDelete, restoreNote,
    permanentDelete, emptyTrash, importNotes, exportNotes,
  } = useNotes();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedNote = [...activeNotes, ...trashedNotes].find((n) => n.id === selectedId) || null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleCreate();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCreate = () => {
    setShowTrash(false);
    const note = createNote();
    setSelectedId(note.id);
    toast.success("New note created");
  };

  const handleDelete = (id: string) => {
    softDelete(id);
    setSelectedId(null);
    toast("Note moved to trash", { action: { label: "Undo", onClick: () => restoreNote(id) } });
  };

  const handleRestore = (id: string) => {
    restoreNote(id);
    toast.success("Note restored");
  };

  const handlePermanentDelete = (id: string) => {
    permanentDelete(id);
    if (selectedId === id) setSelectedId(null);
    toast.success("Note permanently deleted");
  };

  const handleEmptyTrash = () => {
    emptyTrash();
    setSelectedId(null);
    toast.success("Trash emptied");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          importNotes(data);
          toast.success(`Imported ${data.length} notes`);
        } else {
          toast.error("Invalid file format");
        }
      } catch {
        toast.error("Failed to parse file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NotesSidebar
          activeNotes={activeNotes}
          trashedNotes={trashedNotes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={handleCreate}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
          showTrash={showTrash}
          onToggleTrash={setShowTrash}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-12 flex items-center justify-between px-3 border-b border-border shrink-0">
            <SidebarTrigger />
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={exportNotes} title="Export notes">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => fileRef.current?.click()} title="Import notes">
                <Upload className="h-4 w-4" />
              </Button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>

          {/* Main content */}
          {selectedNote && !selectedNote.deleted ? (
            <NoteEditor note={selectedNote} onUpdate={updateNote} onDelete={handleDelete} />
          ) : (
            <EmptyState onCreate={handleCreate} isTrash={showTrash} />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
