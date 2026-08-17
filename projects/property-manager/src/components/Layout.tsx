import { useState, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Home, Building2, Users, DollarSign, Wrench, BarChart3, Settings, Menu, X, Upload, Download, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/properties', icon: Building2, label: 'Properties' },
  { to: '/tenants', icon: Users, label: 'Tenants' },
  { to: '/payments', icon: DollarSign, label: 'Payments' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/properties': 'Properties',
  '/tenants': 'Tenants',
  '/payments': 'Payments',
  '/maintenance': 'Maintenance',
  '/reports': 'Reports',
};

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportData, importData, clearAllData } = useApp();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || (location.pathname.startsWith('/properties/') ? 'Property Details' : 'Not Found');

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      importData(reader.result as string);
      setSettingsOpen(false);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <Building2 className="h-7 w-7 text-primary" />
        <span className="text-lg font-bold text-sidebar-accent-foreground">PropManager</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors w-full"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="sidebar-container hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center px-4 gap-4 bg-card flex-shrink-0">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button onClick={() => setSettingsOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { exportData(); setSettingsOpen(false); }}>
                <Download className="h-4 w-4" /> Export Data as JSON
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Import Data from JSON
              </Button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => { setSettingsOpen(false); setConfirmClear(true); }}>
                <Trash2 className="h-4 w-4" /> Clear All Data
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmClear}
        message="This will permanently delete all your data. Are you sure?"
        confirmLabel="Clear All Data"
        onConfirm={() => { clearAllData(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
