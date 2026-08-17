import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmVariant?: 'destructive' | 'default';
  children?: React.ReactNode;
}

export function ConfirmDialog({ isOpen, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmVariant = 'destructive', children }: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-[400px] p-6 mx-4">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <p className="text-sm">{message}</p>
          {children}
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
