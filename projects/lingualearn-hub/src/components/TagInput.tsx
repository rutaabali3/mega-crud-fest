import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  className?: string;
}

export function TagInput({ tags, onChange, suggestions = [], className }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-background min-h-[42px]">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-default">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
      {input && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filteredSuggestions.slice(0, 5).map(s => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="px-2 py-0.5 text-xs rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-default"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
