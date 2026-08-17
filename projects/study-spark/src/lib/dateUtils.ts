export function relativeDate(iso: string | null): string {
  if (!iso) return 'Never';
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return 'Today';
    if (absDays === 1) return 'Tomorrow';
    return `In ${absDays} days`;
  }
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function formatFullDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function dueStatus(nextReview: string): { text: string; color: string } {
  const now = new Date();
  const due = new Date(nextReview);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -1) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-destructive' };
  if (diffDays < 0) return { text: 'Overdue', color: 'text-destructive' };
  if (diffDays === 0) return { text: 'Due today', color: 'text-amber' };
  if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-muted-foreground' };
  return { text: `Due in ${diffDays} days`, color: 'text-muted-foreground' };
}
