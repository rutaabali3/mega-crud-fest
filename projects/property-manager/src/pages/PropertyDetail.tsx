import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, Property } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SlideOverPanel } from '@/components/SlideOverPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const tabs = ['Overview', 'Tenant History', 'Payments', 'Maintenance', 'Expenses'];

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, tenants, payments, maintenance, expenses, updateProperty, addPayment, markPaid, addMaintenance, addExpense } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ address: '', unit: '', type: '', bedrooms: 0, bathrooms: 0, sqft: 0, purchasePrice: 0, monthlyMortgage: 0, photoUrl: '' });

  const property = properties.find(p => p.id === id);

  useEffect(() => {
    if (property) {
      setForm({ address: property.address, unit: property.unit, type: property.type, bedrooms: property.bedrooms, bathrooms: property.bathrooms, sqft: property.sqft, purchasePrice: property.purchasePrice, monthlyMortgage: property.monthlyMortgage, photoUrl: property.photoUrl });
    }
  }, [property, editOpen]);

  if (!property) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground mb-4">Property not found</p>
      <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
    </div>
  );

  const propTenants = tenants.filter(t => t.propertyId === id);
  const propPayments = payments.filter(p => p.propertyId === id);
  const propMaintenance = maintenance.filter(m => m.propertyId === id);
  const propExpenses = expenses.filter(e => e.propertyId === id);
  const activeTenant = propTenants.find(t => t.status === 'active');

  const handleSave = () => {
    if (!form.address || !form.type) { toast.error('Please fill required fields'); return; }
    updateProperty(property.id, form);
    setEditOpen(false);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/properties')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Properties</Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 h-40 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
          {property.photoUrl ? <img src={property.photoUrl} className="w-full h-full object-cover" /> : <Building2 className="h-12 w-12 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{property.address}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={property.status} />
                <span className="text-sm text-muted-foreground">{property.type} • {property.bedrooms} bed / {property.bathrooms} bath / {property.sqft.toLocaleString()} sqft</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>Edit Property</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} className={cn('px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors', activeTab === i ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="bg-card rounded-xl shadow-sm border p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ['Address', property.address],
              ['Unit', property.unit || '—'],
              ['Type', property.type],
              ['Bedrooms', property.bedrooms],
              ['Bathrooms', property.bathrooms],
              ['Square Feet', property.sqft.toLocaleString()],
              ['Purchase Price', formatCurrency(property.purchasePrice)],
              ['Monthly Mortgage', formatCurrency(property.monthlyMortgage)],
              ['Status', property.status],
              ['Created', formatDate(property.createdAt)],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="text-muted-foreground text-xs">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-3">
          {propTenants.length === 0 ? <EmptyState icon="👤" title="No tenants" description="No tenant history for this property." /> : propTenants.map(t => (
            <div key={t.id} className="bg-card rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{t.name}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>📞 {t.phone} • ✉️ {t.email}</div>
                <div>Lease: {formatDate(t.leaseStart)} — {formatDate(t.leaseEnd)}</div>
                <div>Rent: {formatCurrency(t.monthlyRent)} • Deposit: {formatCurrency(t.depositHeld)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 2 && (
        <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
          {propPayments.length === 0 ? <EmptyState icon="💰" title="No payments" description="No payment records for this property." /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Tenant</th><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Due</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Paid</th>
              </tr></thead>
              <tbody>
                {propPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3">{tenants.find(t => t.id === p.tenantId)?.name || '—'}</td>
                    <td className="p-3 capitalize">{p.type}</td>
                    <td className="p-3">{formatDate(p.dueDate)}</td>
                    <td className="p-3">{formatCurrency(p.amount)}</td>
                    <td className="p-3"><StatusBadge status={p.status} /></td>
                    <td className="p-3">{p.paidDate ? formatDate(p.paidDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-3">
          {propMaintenance.length === 0 ? <EmptyState icon="🔧" title="No requests" description="No maintenance requests for this property." /> : propMaintenance.map(m => (
            <div key={m.id} className="bg-card rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={m.priority} />
                <StatusBadge status={m.status} />
              </div>
              <h3 className="font-semibold text-sm">{m.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
              <div className="text-xs text-muted-foreground mt-2">
                Cost: {m.cost > 0 ? formatCurrency(m.cost) : '—'} • {m.contractorName || 'No contractor'}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 4 && (
        <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
          {propExpenses.length === 0 ? <EmptyState icon="📋" title="No expenses" description="No expenses recorded for this property." /> : (
            <>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground">
                  <th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Category</th><th className="p-3 font-medium">Description</th><th className="p-3 font-medium">Amount</th><th className="p-3 font-medium">Recurring</th>
                </tr></thead>
                <tbody>
                  {propExpenses.map(e => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="p-3">{formatDate(e.date)}</td>
                      <td className="p-3 capitalize">{e.category}</td>
                      <td className="p-3">{e.description}</td>
                      <td className="p-3">{formatCurrency(e.amount)}</td>
                      <td className="p-3">{e.recurring ? '✓' : '—'}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="p-3" colSpan={3}>Total Expenses</td>
                    <td className="p-3">{formatCurrency(propExpenses.reduce((s, e) => s + e.amount, 0))}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      <SlideOverPanel isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Property" onSave={handleSave}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Address *</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Unit</label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Type *</label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Apartment', 'House', 'Studio', 'Commercial'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Beds</label><Input type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: +e.target.value })} /></div>
            <div><label className="text-sm font-medium">Baths</label><Input type="number" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: +e.target.value })} /></div>
            <div><label className="text-sm font-medium">Sqft</label><Input type="number" value={form.sqft} onChange={e => setForm({ ...form, sqft: +e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Purchase Price</label><Input type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: +e.target.value })} /></div>
            <div><label className="text-sm font-medium">Monthly Mortgage</label><Input type="number" value={form.monthlyMortgage} onChange={e => setForm({ ...form, monthlyMortgage: +e.target.value })} /></div>
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
      </SlideOverPanel>
    </div>
  );
}
