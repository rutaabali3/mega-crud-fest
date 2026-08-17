import { useState, useRef, useEffect } from "react";
import { Plus, Search, Trash2, FileText, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Note } from "@/hooks/useNotes";

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface NotesSidebarProps {
  activeNotes: Note[];
  trashedNotes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  showTrash: boolean;
  onToggleTrash: (v: boolean) => void;
}

export function NotesSidebar({
  activeNotes,
  trashedNotes,
  selectedId,
  onSelect,
  onCreate,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  showTrash,
  onToggleTrash,
}: NotesSidebarProps) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const list = showTrash ? trashedNotes : activeNotes;
  const filtered = search
    ? list.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          stripHtml(n.content).toLowerCase().includes(search.toLowerCase())
      )
    : list;

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <StickyNote className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">LocalVibe Notes</h1>
        </div>
        <Button onClick={onCreate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes... (⌘K)"
            className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {showTrash ? "Trash" : "All Notes"}
            </span>
            <span className="text-xs text-muted-foreground">{filtered.length}</span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <AnimatePresence mode="popLayout">
                {filtered.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SidebarMenuItem>
                      <button
                        onClick={() => onSelect(note.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex gap-2 transition-colors group ${
                          selectedId === note.id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50"
                        }`}
                      >
                        <div
                          className="w-1 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: note.color, height: "calc(100% - 4px)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{note.title || "Untitled"}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {stripHtml(note.content).slice(0, 60) || "No content"}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {note.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {tag}
                              </Badge>
                            ))}
                            <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(note.updatedAt)}</span>
                          </div>
                        </div>
                      </button>
                      {showTrash && (
                        <div className="flex gap-1 px-3 pb-1">
                          <Button size="sm" variant="outline" className="h-6 text-xs flex-1" onClick={() => onRestore(note.id)}>
                            Restore
                          </Button>
                          <Button size="sm" variant="destructive" className="h-6 text-xs flex-1" onClick={() => onPermanentDelete(note.id)}>
                            Delete
                          </Button>
                        </div>
                      )}
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {search ? "No matching notes" : showTrash ? "Trash is empty" : "No notes yet"}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {showTrash && trashedNotes.length > 0 && (
          <Button size="sm" variant="destructive" className="w-full text-xs" onClick={onEmptyTrash}>
            Empty Trash
          </Button>
        )}
        <Button
          variant={showTrash ? "default" : "ghost"}
          size="sm"
          className="w-full gap-2 text-sm"
          onClick={() => onToggleTrash(!showTrash)}
        >
          {showTrash ? <FileText className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          {showTrash ? "Back to Notes" : `Trash (${trashedNotes.length})`}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
