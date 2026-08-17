import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Delete", variant = "danger", onConfirm, onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-full p-2 ${variant === "danger" ? "bg-destructive/10" : "bg-orange-100"}`}>
            <AlertTriangle className={`h-5 w-5 ${variant === "danger" ? "text-destructive" : "text-orange-500"}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors ${
              variant === "danger"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
