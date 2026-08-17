import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const STORAGE_KEYS = ['petcare_pets', 'petcare_health_visits', 'petcare_health_vaccinations', 'petcare_feedings_schedules', 'petcare_feedings_logs', 'petcare_weights', 'petcare_medications', 'petcare_theme'];

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);

  const exportData = () => {
    const data: Record<string, unknown> = {};
    STORAGE_KEYS.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) data[key] = JSON.parse(val);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'petcare_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      Object.entries(data).forEach(([key, value]) => {
        if (STORAGE_KEYS.includes(key)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      toast.success('Data imported! Reload to see changes.');
      setShowImport(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error('Invalid JSON data');
    }
  };

  const clearAll = () => {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    toast.success('All data cleared!');
    setShowFinalConfirm(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings ⚙️</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4" /> Export Data</CardTitle>
          <CardDescription>Download a backup of all your pet care data as JSON.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportData} className="rounded-xl">Export All Data</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Import Data</CardTitle>
          <CardDescription>Restore data from a backup JSON file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {showImport ? (
            <>
              <Textarea value={importData} onChange={e => setImportData(e.target.value)} className="rounded-xl font-mono text-xs" rows={6} placeholder="Paste your backup JSON here..." />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowImport(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleImport} className="rounded-xl">Import</Button>
              </div>
            </>
          ) : (
            <Button variant="outline" onClick={() => setShowImport(true)} className="rounded-xl">Import Data</Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Clear All Data</CardTitle>
          <CardDescription>Permanently delete all pet care data. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowClearConfirm(true)} className="rounded-xl">Clear All Data</Button>
        </CardContent>
      </Card>

      {/* First confirm */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will delete ALL your pet care data permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowClearConfirm(false); setShowFinalConfirm(true); }} className="rounded-xl bg-destructive">Yes, I'm sure</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second confirm */}
      <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">⚠️ Final Warning</AlertDialogTitle>
            <AlertDialogDescription>This is your LAST CHANCE. All data will be permanently deleted. Export a backup first if needed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAll} className="rounded-xl bg-destructive">Delete Everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
