import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useRef } from 'react';

const SettingsPage = () => {
  const { exportData, importData, subscriptions } = useSubscriptions();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importData(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your data</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Data Management</h3>
        <p className="text-sm text-muted-foreground">You have {subscriptions.length} subscriptions stored locally.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={exportData} variant="outline" className="border-white/10 hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" /> Export JSON
          </Button>
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="border-white/10 hover:bg-white/5">
            <Upload className="w-4 h-4 mr-2" /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Keyboard Shortcuts</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Add new subscription</span>
          <kbd className="px-2 py-1 rounded bg-background/50 border border-white/10 font-mono text-xs">N</kbd>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-2">About</h3>
        <p className="text-sm text-muted-foreground">SubVault — Subscription & Bill Tracker</p>
        <p className="text-xs text-muted-foreground mt-1">All data is stored locally in your browser. No account required.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
