import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { GearItem } from '@/types';

interface GearChecklistProps {
  gear: GearItem[];
  onToggle: (id: string) => void;
  onAdd: (item: GearItem) => void;
  onRemove: (id: string) => void;
}

export function GearChecklist({ gear, onToggle, onAdd, onRemove }: GearChecklistProps) {
  const [newItem, setNewItem] = useState('');

  const packed = gear.filter(g => g.packed).length;

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd({ id: crypto.randomUUID(), name: newItem.trim(), packed: false });
    setNewItem('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{packed}/{gear.length} packed</p>
      </div>
      <div className="space-y-1.5">
        {gear.map(item => (
          <div key={item.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 group">
            <Checkbox checked={item.packed} onCheckedChange={() => onToggle(item.id)} />
            <span className={item.packed ? 'line-through text-muted-foreground flex-1' : 'flex-1 text-sm'}>{item.name}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => onRemove(item.id)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add gear item..." className="h-9"
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <Button size="sm" variant="outline" onClick={handleAdd} disabled={!newItem.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
