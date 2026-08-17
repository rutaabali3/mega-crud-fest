import { useState } from "react";
import { VocabEntry } from "@/lib/types";
import { MasteryBar } from "@/components/MasteryBar";
import { Pencil, Trash2, CheckCircle, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_COLORS: Record<string, string> = {
  Spanish: "bg-primary/15 text-primary",
  Japanese: "bg-destructive/15 text-destructive",
  French: "bg-accent/15 text-accent-foreground",
};

const DIFF_COLORS: Record<string, string> = {
  beginner: "bg-success/15 text-success",
  intermediate: "bg-warning/15 text-warning",
  advanced: "bg-destructive/15 text-destructive",
};

interface VocabCardProps {
  entry: VocabEntry;
  onEdit: (entry: VocabEntry) => void;
  onDelete: (id: string) => void;
  onMastered: (entry: VocabEntry) => void;
  onUnmaster: (entry: VocabEntry) => void;
  bulkMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function VocabCard({ entry, onEdit, onDelete, onMastered, onUnmaster, bulkMode, selected, onToggleSelect }: VocabCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={cn(
        "group border rounded-xl bg-card p-4 transition-default hover:shadow-md relative",
        selected && "ring-2 ring-primary",
        entry.isMastered && "opacity-70"
      )}
    >
      {bulkMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.(entry.id)}
          className="absolute top-3 right-3 h-4 w-4 accent-primary"
        />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold truncate" title={entry.word}>{entry.word}</h3>
          <p className="text-sm text-muted-foreground truncate" title={entry.translation}>{entry.translation}</p>
        </div>
        {!bulkMode && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-default shrink-0">
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded-md hover:bg-muted transition-default" title="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-default" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 text-xs">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-2 py-1 rounded bg-muted">Cancel</button>
                <button onClick={() => onDelete(entry.id)} className="px-2 py-1 rounded bg-destructive text-destructive-foreground">Delete</button>
              </div>
            )}
            {!entry.isMastered ? (
              <button onClick={() => onMastered(entry)} className="p-1.5 rounded-md hover:bg-success/10 text-success transition-default" title="Mark Mastered">
                <CheckCircle className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={() => onUnmaster(entry)} className="p-1.5 rounded-md hover:bg-warning/10 text-warning transition-default" title="Unmaster — reset to learning">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", LANG_COLORS[entry.targetLanguage] || "bg-muted text-muted-foreground")}>
          {entry.targetLanguage}
        </span>
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", DIFF_COLORS[entry.difficulty])}>
          {entry.difficulty}
        </span>
        {entry.isMastered && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">✓ Mastered</span>
        )}
      </div>

      <MasteryBar level={entry.masteryLevel} className="mb-3" />

      <div className="flex flex-wrap gap-1 mb-2">
        {entry.tags.map(tag => (
          <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
        ))}
      </div>

      {entry.source && (
        <p className="text-xs text-muted-foreground/70 mb-2">{entry.source}</p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-primary flex items-center gap-1 hover:underline"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Less" : "More"}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-2 text-sm animate-in fade-in slide-in-from-top-1">
          {entry.exampleSentence && (
            <p className="italic text-muted-foreground">"{entry.exampleSentence}"</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>✓ Correct: {entry.timesCorrect}</div>
            <div>✗ Incorrect: {entry.timesIncorrect}</div>
            <div>Last reviewed: {entry.lastReviewedDate ? new Date(entry.lastReviewedDate).toLocaleDateString() : "Never"}</div>
            <div>Next review: {new Date(entry.nextReviewDate).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
