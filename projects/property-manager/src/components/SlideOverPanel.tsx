import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
}

export function SlideOverPanel({ isOpen, onClose, title, children, onSave, saveLabel = 'Save' }: SlideOverPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-card text-card-foreground shadow-xl animate-slide-in-right flex flex-col h-full">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        <div className="flex items-center justify-end gap-3 p-5 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {onSave && <Button onClick={onSave}>{saveLabel}</Button>}
        </div>
      </div>
    </div>
  );
}
