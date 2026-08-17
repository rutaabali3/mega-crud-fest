import { MediaStatus, STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const colors: Record<MediaStatus, string> = {
  want: "bg-[hsl(var(--status-want)/0.15)] text-[hsl(var(--status-want))]",
  "in-progress": "bg-[hsl(var(--status-progress)/0.15)] text-[hsl(var(--status-progress))]",
  finished: "bg-[hsl(var(--status-finished)/0.15)] text-[hsl(var(--status-finished))]",
};

export function StatusBadge({ status }: { status: MediaStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide", colors[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
