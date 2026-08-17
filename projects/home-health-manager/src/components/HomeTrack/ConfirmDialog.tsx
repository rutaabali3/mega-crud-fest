import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
