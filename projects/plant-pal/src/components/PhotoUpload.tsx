import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface Props {
  value: string;
  onChange: (dataUrl: string) => void;
  className?: string;
  label?: string;
}

export const PhotoUpload = ({ value, onChange, className, label = 'Upload Photo' }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Image must be under 20MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <label className="text-sm font-medium mb-1 block">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="p-1.5 bg-card rounded-full hover:bg-muted transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onChange('')}
              className="p-1.5 bg-card rounded-full hover:bg-muted transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed border-border rounded-xl py-6 flex flex-col items-center gap-2',
            'text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors'
          )}
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs">Click to upload (max 20MB)</span>
        </button>
      )}
    </div>
  );
};
