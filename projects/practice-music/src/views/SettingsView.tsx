import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Settings } from '../utils/storage';
import { exportAllData, importData, clearAllData, getStorageSize } from '../utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Props {
  settings: Settings;
  onUpdateSettings: (s: Settings) => void;
  onRefreshData: () => void;
}

export function SettingsView({ settings, onUpdateSettings, onRefreshData }: Props) {
  const [defaultInstrument, setDefaultInstrument] = useState(settings.defaultInstrument);
  const [weeklyGoal, setWeeklyGoal] = useState(settings.weeklyGoalMinutes);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSaveGeneral = () => {
    onUpdateSettings({ ...settings, defaultInstrument, weeklyGoalMinutes: weeklyGoal });
    toast.success('Settings saved');
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-log-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        importData(data);
        onRefreshData();
        toast.success('Data imported successfully');
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClearAll = () => {
    if (deleteConfirm !== 'DELETE EVERYTHING') return;
    clearAllData();
    onRefreshData();
    setShowDeleteModal(false);
    setDeleteConfirm('');
    toast.success('All data cleared');
  };

  const storageKB = (getStorageSize() / 1024).toFixed(1);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* General */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">General</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Default Instrument</label>
            <Input value={defaultInstrument} onChange={e => setDefaultInstrument(e.target.value)} className="bg-muted border-border" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Weekly Goal (minutes)</label>
            <Input type="number" value={weeklyGoal} onChange={e => setWeeklyGoal(Number(e.target.value))} className="bg-muted border-border w-32" min={30} max={600} />
          </div>
          <Button onClick={handleSaveGeneral} className="bg-primary hover:bg-primary/90">Save</Button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">Data Management</h2>
        <div className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full justify-start gap-2 border-border">
            <Download size={16} /> Export All Data
          </Button>
          <div>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full justify-start gap-2 border-border">
              <Upload size={16} /> Import Data
            </Button>
          </div>
          <Button onClick={() => setShowDeleteModal(true)} variant="outline" className="w-full justify-start gap-2 border-border text-destructive hover:bg-destructive/10">
            <Trash2 size={16} /> Clear All Data
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">About</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>PracticeLog v1.0.0</p>
          <p>localStorage usage: ~{storageKB} KB</p>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-foreground text-lg mb-2">Clear All Data</h3>
            <p className="text-sm text-muted-foreground mb-4">This will permanently delete all your pieces, sessions, goals, and settings. Type <strong className="text-destructive">DELETE EVERYTHING</strong> to confirm.</p>
            <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="bg-muted border-border mb-4" placeholder="Type DELETE EVERYTHING" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-border">Cancel</Button>
              <Button onClick={handleClearAll} disabled={deleteConfirm !== 'DELETE EVERYTHING'} className="bg-destructive hover:bg-destructive/90">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
