import { useState, useEffect, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Trash2, Code, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Note } from "@/hooks/useNotes";

const PRESET_COLORS = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#64748b",
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

export function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagInput, setTagInput] = useState("");
  const [markdownMode, setMarkdownMode] = useState(false);
  const [customColor, setCustomColor] = useState(note.color);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef(note.id);

  // Reset local state when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCustomColor(note.color);
    setMarkdownMode(false);
    noteIdRef.current = note.id;
  }, [note.id]);

  // Auto-save every 3s
  const scheduleAutoSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onUpdate(noteIdRef.current, { title, content });
      toast.success("Note saved", { duration: 1500 });
    }, 3000);
  }, [title, content, onUpdate]);

  useEffect(() => {
    scheduleAutoSave();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [title, content, scheduleAutoSave]);

  // Save on blur
  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onUpdate(noteIdRef.current, { title, content });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !note.tags.includes(tag)) {
      onUpdate(note.id, { tags: [...note.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) });
  };

  const setColor = (color: string) => {
    setCustomColor(color);
    onUpdate(note.id, { color });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" onBlur={handleBlur}>
      {/* Subtle color tint bar at top */}
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: note.color }} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-4" style={{ backgroundColor: `${note.color}08` }}>
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
        />

        {/* Color picker + delete */}
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                note.color === c ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <Input
            type="color"
            value={customColor}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-none cursor-pointer"
          />
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-xs"
              onClick={() => setMarkdownMode(!markdownMode)}
            >
              {markdownMode ? <FileText className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
              {markdownMode ? "Rich Text" : "Markdown"}
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1.5 text-xs" onClick={() => onDelete(note.id)}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {note.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addTag(); }
              if (e.key === "Backspace" && !tagInput && note.tags.length) {
                removeTag(note.tags[note.tags.length - 1]);
              }
            }}
            placeholder="Add tag..."
            className="w-28 h-7 text-xs bg-transparent border-dashed"
          />
        </div>

        {/* Editor */}
        {markdownMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write markdown..."
              className="min-h-[400px] font-mono text-sm bg-card"
            />
            <div className="markdown-preview p-4 bg-card rounded-md border min-h-[400px] overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={QUILL_MODULES}
            placeholder="Start writing..."
          />
        )}
      </div>
    </div>
  );
}
