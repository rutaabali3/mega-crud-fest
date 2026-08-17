import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Property } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SlideOverPanel } from '@/components/SlideOverPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LayoutGrid, List, Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emptyForm = { address: '', unit: '', type: '', bedrooms: 0, bathrooms: 0, sqft: 0, purchasePrice: 0, monthlyMortgage: 0, photoUrl: '' };

export default function Properties() {
  const { properties, tenants, addProperty, updateProperty, archiveProperty, unarchiveProperty } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);

  const displayProperties = properties
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => p.address.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    if (editingProperty) {
      setForm({
        address: editingProperty.address,
        unit: editingProperty.unit,
        type: editingProperty.type,
        bedrooms: editingProperty.bedrooms,
        bathrooms: editingProperty.bathrooms,
        sqft: editingProperty.sqft,
        purchasePrice: editingProperty.purchasePrice,
        monthlyMortgage: editingProperty.monthlyMortgage,
        photoUrl: editingProperty.photoUrl,
      });
    }
  }, [editingProperty]);

  const handleSave = () => {
    if (!form.address || !form.type) {
      toast.error('Please fill required fields');
      return;
    }
    if (editingProperty) {
      updateProperty(editingProperty.id, form);
      setEditingProperty(null);
    } else {
      addProperty({ ...form, status: 'vacant', createdAt: new Date().toISOString() } as Omit<Property, 'id'>);
      setIsAddOpen(false);
    }
    setForm(emptyForm);
  };

  const handleArchive = () => {
    if (!confirmArchive) return;
    const hasActiveTenant = tenants.some(t => t.propertyId === confirmArchive.id && t.status === 'active');
    if (hasActiveTenant) {
      toast.error('Cannot archive: property has active tenant');
      setConfirmArchive(null);
      return;
    }
    archiveProperty(confirmArchive.id);
    setConfirmArchive(null);
  };

  const filterTabs = ['all', 'occupied', 'vacant', 'archived'];

  const PropertyForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Address *</label>
        <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City, State" />
      </div>
      <div>
        <label className="text-sm font-medium">Unit</label>
        <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Apt 2B" />
      </div>
      <div>
        <label className="text-sm font-medium">Type *</label>
        <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            {['Apartment', 'House', 'Studio', 'Commercial'].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-sm font-medium">Beds</label><Input type="number" min={0} max={20} value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: +e.target.value })} /></div>
        <div><label className="text-sm font-medium">Baths</label><Input type="number" min={0} max={10} step={0.5} value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: +e.target.value })} /></div>
        <div><label className="text-sm font-medium">Sqft</label><Input type="number" min={0} value={form.sqft} onChange={e => setForm({ ...form, sqft: +e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Purchase Price</label><Input type="number" min={0} value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: +e.target.value })} /></div>
        <div><label className="text-sm font-medium">Monthly Mortgage</label><Input type="number" min={0} value={form.monthlyMortgage} onChange={e => setForm({ ...form, monthlyMortgage: +e.target.value })} /></div>
      </div>
      <div>
        <label className="text-sm font-medium">Photo</label>
        {form.photoUrl && (
          <div className="relative mb-2">
            <img src={form.photoUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
            <button type="button" onClick={() => setForm({ ...form, photoUrl: '' })} className="absolute top-1 right-1 bg-black/50 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-black/70">×</button>
          </div>
        )}
        <Input type="file" accept="image/*" onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size < 20 * 1024) { toast.error('Image must be at least 20KB'); return; }
          const reader = new FileReader();
          reader.onload = () => setForm(f => ({ ...f, photoUrl: reader.result as string }));
          reader.readAsDataURL(file);
        }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by address..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {filterTabs.map(tab => (
            <button key={tab} onClick={() => setFilterStatus(tab)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors', filterStatus === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-muted' : ''}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-muted' : ''}><List className="h-4 w-4" /></Button>
          <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Property</Button>
        </div>
      </div>

      {displayProperties.length === 0 ? (
        <EmptyState icon="🏢" title="No properties found" description="Add your first property to get started." actionLabel="Add Property" onAction={() => { setForm(emptyForm); setIsAddOpen(true); }} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayProperties.map(p => {
            const activeTenant = tenants.find(t => t.propertyId === p.id && t.status === 'active');
            return (
              <div key={p.id} className="bg-card rounded-xl shadow-sm border overflow-hidden">
                <div className="h-36 bg-muted flex items-center justify-center">
                  {p.photoUrl ? <img src={p.photoUrl} alt={p.address} className="w-full h-full object-cover" /> : <Building2 className="h-10 w-10 text-muted-foreground" />}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm">{p.address}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {p.unit && <span>{p.unit}</span>}
                    <span className="bg-muted px-1.5 py-0.5 rounded text-xs">{p.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.bedrooms} bed / {p.bathrooms} bath / {p.sqft.toLocaleString()} sqft</div>
                  <StatusBadge status={p.status} />
                  {activeTenant && (
                    <>
                      <div className="text-xs">{activeTenant.name}</div>
                      <div className="text-xs text-muted-foreground">Lease ends: {formatDate(activeTenant.leaseEnd)}</div>
                      <div className="text-xs font-medium">Rent: {formatCurrency(activeTenant.monthlyRent)}/mo</div>
                    </>
                  )}
                  {!activeTenant && <div className="text-xs text-muted-foreground">Rent: —</div>}
                </div>
                <div className="flex border-t">
                  <button className="flex-1 py-2 text-xs font-medium text-primary hover:bg-muted/50 transition-colors" onClick={() => navigate(`/properties/${p.id}`)}>Details</button>
                  <button className="flex-1 py-2 text-xs font-medium hover:bg-muted/50 transition-colors border-l" onClick={() => setEditingProperty(p)}>Edit</button>
                  {p.status !== 'archived' && <button className="flex-1 py-2 text-xs font-medium text-destructive hover:bg-muted/50 transition-colors border-l" onClick={() => setConfirmArchive(p)}>Archive</button>}
                  {p.status === 'archived' && <button className="flex-1 py-2 text-xs font-medium text-success hover:bg-muted/50 transition-colors border-l" onClick={() => unarchiveProperty(p.id)}>Unarchive</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Address</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Tenant</th>
                <th className="p-3 font-medium">Rent/mo</th>
                <th className="p-3 font-medium">Lease End</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayProperties.map(p => {
                const activeTenant = tenants.find(t => t.propertyId === p.id && t.status === 'active');
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3">{p.address}{p.unit ? ` ${p.unit}` : ''}</td>
                    <td className="p-3">{p.type}</td>
                    <td className="p-3"><StatusBadge status={p.status} /></td>
                    <td className="p-3">{activeTenant?.name || '—'}</td>
                    <td className="p-3">{activeTenant ? formatCurrency(activeTenant.monthlyRent) : '—'}</td>
                    <td className="p-3">{activeTenant ? formatDate(activeTenant.leaseEnd) : '—'}</td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/properties/${p.id}`)}>Details</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProperty(p)}>Edit</Button>
                      {p.status !== 'archived' && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmArchive(p)}>Archive</Button>}
                      {p.status === 'archived' && <Button size="sm" variant="ghost" className="text-success" onClick={() => unarchiveProperty(p.id)}>Unarchive</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SlideOverPanel isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm(emptyForm); }} title="Add Property" onSave={handleSave}>
        <PropertyForm />
      </SlideOverPanel>

      <SlideOverPanel isOpen={!!editingProperty} onClose={() => { setEditingProperty(null); setForm(emptyForm); }} title="Edit Property" onSave={handleSave}>
        <PropertyForm />
      </SlideOverPanel>

      <ConfirmDialog
        isOpen={!!confirmArchive}
        message={`Archive ${confirmArchive?.address}? This property will be hidden from active views.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(null)}
      />
    </div>
  );
}
