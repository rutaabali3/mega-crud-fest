import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Tenant } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SlideOverPanel } from '@/components/SlideOverPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emptyForm = { propertyId: '', name: '', email: '', phone: '', leaseStart: '', leaseEnd: '', monthlyRent: 0, depositHeld: 0, notes: '' };

export default function Tenants() {
  const { tenants, properties, addTenant, updateTenant, archiveTenant } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [archivingTenant, setArchivingTenant] = useState<Tenant | null>(null);
  const [depositChecked, setDepositChecked] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const displayTenants = tenants
    .filter(t => t.status === activeTab)
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabCounts = {
    active: tenants.filter(t => t.status === 'active').length,
    past: tenants.filter(t => t.status === 'past').length,
    archived: tenants.filter(t => t.status === 'archived').length,
  };

  useEffect(() => {
    if (editingTenant) {
      setForm({
        propertyId: editingTenant.propertyId,
        name: editingTenant.name,
        email: editingTenant.email,
        phone: editingTenant.phone,
        leaseStart: editingTenant.leaseStart,
        leaseEnd: editingTenant.leaseEnd,
        monthlyRent: editingTenant.monthlyRent,
        depositHeld: editingTenant.depositHeld,
        notes: editingTenant.notes,
      });
    }
  }, [editingTenant]);

  const handleSave = () => {
    if (!form.propertyId || !form.name || !form.email || !form.phone || !form.leaseStart || !form.leaseEnd || form.monthlyRent <= 0) {
      toast.error('Please fill all required fields');
      return;
    }
    if (new Date(form.leaseEnd) <= new Date(form.leaseStart)) {
      toast.error('Lease end must be after start date');
      return;
    }
    if (editingTenant) {
      updateTenant(editingTenant.id, form);
      setEditingTenant(null);
    } else {
      addTenant({ ...form, status: 'active', depositReturned: false } as Omit<Tenant, 'id'>);
      setIsAddOpen(false);
    }
    setForm(emptyForm);
  };

  const vacantProperties = properties.filter(p => p.status === 'vacant');
  const allNonArchived = properties.filter(p => p.status !== 'archived');

  const TenantForm = ({ isEdit }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Property *</label>
        <Select value={form.propertyId} onValueChange={v => setForm({ ...form, propertyId: v })}>
          <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
          <SelectContent>
            {(isEdit ? allNonArchived : vacantProperties).map(p => (
              <SelectItem key={p.id} value={p.id}>{p.address} {p.unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
      <div><label className="text-sm font-medium">Email *</label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div><label className="text-sm font-medium">Phone *</label><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Lease Start *</label><Input type="date" value={form.leaseStart} onChange={e => setForm({ ...form, leaseStart: e.target.value })} /></div>
        <div><label className="text-sm font-medium">Lease End *</label><Input type="date" value={form.leaseEnd} onChange={e => setForm({ ...form, leaseEnd: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Monthly Rent *</label><Input type="number" min={1} value={form.monthlyRent} onChange={e => setForm({ ...form, monthlyRent: +e.target.value })} /></div>
        <div><label className="text-sm font-medium">Deposit Held *</label><Input type="number" min={0} value={form.depositHeld} onChange={e => setForm({ ...form, depositHeld: +e.target.value })} /></div>
      </div>
      <div><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['active', 'past', 'archived'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors', activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {tab} ({tabCounts[tab]})
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tenants..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Button className="ml-auto" onClick={() => { setForm(emptyForm); setIsAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Tenant</Button>
      </div>

      {displayTenants.length === 0 ? (
        <EmptyState icon="👤" title="No tenants" description={`No ${activeTab} tenants found.`} actionLabel="Add Tenant" onAction={() => { setForm(emptyForm); setIsAddOpen(true); }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayTenants.map(t => {
            const prop = properties.find(p => p.id === t.propertyId);
            const totalDays = (new Date(t.leaseEnd).getTime() - new Date(t.leaseStart).getTime()) / 86400000;
            const elapsed = (Date.now() - new Date(t.leaseStart).getTime()) / 86400000;
            const percent = Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
            const daysLeft = Math.ceil((new Date(t.leaseEnd).getTime() - Date.now()) / 86400000);

            return (
              <div key={t.id} className="bg-card rounded-xl shadow-sm border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.name}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="text-sm text-muted-foreground">{prop?.address || 'Unknown property'}</div>
                <div className="text-xs text-muted-foreground">📞 {t.phone} • ✉️ {t.email}</div>
                
                {/* Lease progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{formatDate(t.leaseStart)}</span>
                    <span>{formatDate(t.leaseEnd)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{percent}% of lease elapsed</div>
                </div>

                <div className={cn('text-xs font-medium', daysLeft > 60 ? 'text-success' : daysLeft > 0 ? 'text-warning' : 'text-destructive')}>
                  {daysLeft > 0 ? `${daysLeft <= 60 ? '⚠️ ' : ''}Expires in ${daysLeft} days` : `🔴 Lease expired ${Math.abs(daysLeft)} days ago`}
                </div>

                <div className="text-sm">
                  Monthly Rent: {formatCurrency(t.monthlyRent)} • Deposit: {formatCurrency(t.depositHeld)}
                </div>

                {t.status === 'active' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" onClick={() => setEditingTenant(t)}>Edit</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setArchivingTenant(t); setDepositChecked(false); }}>Archive</Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/payments?tenantId=${t.id}`)}>Payments</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SlideOverPanel isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm(emptyForm); }} title="Add Tenant" onSave={handleSave}>
        <TenantForm />
      </SlideOverPanel>

      <SlideOverPanel isOpen={!!editingTenant} onClose={() => { setEditingTenant(null); setForm(emptyForm); }} title="Edit Tenant" onSave={handleSave}>
        <TenantForm isEdit />
      </SlideOverPanel>

      <ConfirmDialog
        isOpen={!!archivingTenant}
        message={`This will end the tenancy for ${archivingTenant?.name} at ${properties.find(p => p.id === archivingTenant?.propertyId)?.address}.`}
        confirmLabel="Archive Tenancy"
        onConfirm={() => { if (archivingTenant) { archiveTenant(archivingTenant.id, depositChecked); setArchivingTenant(null); } }}
        onCancel={() => setArchivingTenant(null)}
      >
        <label className="flex items-center gap-2 text-sm mt-2">
          <Checkbox checked={depositChecked} onCheckedChange={c => setDepositChecked(!!c)} />
          Deposit has been returned to tenant
        </label>
      </ConfirmDialog>
    </div>
  );
}
