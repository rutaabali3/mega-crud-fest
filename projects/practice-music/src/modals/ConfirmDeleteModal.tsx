import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({ title, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
        <h3 className="font-heading font-bold text-foreground text-lg mb-2">Delete Piece</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to delete <strong className="text-foreground">"{title}"</strong>? This will also remove all related practice sessions. This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} className="border-border">Cancel</Button>
          <Button onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">Delete</Button>
        </div>
      </div>
    </div>
  );
}
