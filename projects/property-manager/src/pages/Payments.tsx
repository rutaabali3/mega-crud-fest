import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp, Payment } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emptyForm = { propertyId: '', tenantId: '', type: 'rent', amount: 0, dueDate: '', paidDate: '', notes: '' };

export default function Payments() {
  const { properties, tenants, payments, addPayment, updatePayment, deletePayment, markPaid } = useApp();
  const [searchParams] = useSearchParams();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPropertyId, setFilterPropertyId] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null);
  const [confirmPaid, setConfirmPaid] = useState<Payment | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Auto-update overdue
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    payments.forEach(p => {
      if (p.status === 'pending' && p.dueDate < today) {
        updatePayment(p.id, { status: 'overdue' });
      }
    });
  }, []);

  // Filter by tenantId from URL
  const urlTenantId = searchParams.get('tenantId');

  const displayPayments = useMemo(() => {
    return payments
      .filter(p => {
        const d = new Date(p.dueDate);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      })
      .filter(p => filterStatus === 'all' || p.status === filterStatus)
      .filter(p => filterPropertyId === 'all' || p.propertyId === filterPropertyId)
      .filter(p => !urlTenantId || p.tenantId === urlTenantId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [payments, selectedYear, selectedMonth, filterStatus, filterPropertyId, urlTenantId]);

  const summary = useMemo(() => {
    const expected = displayPayments.filter(p => p.type === 'rent').reduce((s, p) => s + p.amount, 0);
    const collected = displayPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const outstanding = displayPayments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);
    const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0;
    return { expected, collected, outstanding, rate };
  }, [displayPayments]);

  const handlePrev = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const handleNext = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 12);
    const target = new Date(selectedYear, selectedMonth + 1);
    if (target <= maxDate) {
      if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
      else setSelectedMonth(m => m + 1);
    }
  };

  useEffect(() => {
    if (editingPayment) {
      setForm({
        propertyId: editingPayment.propertyId,
        tenantId: editingPayment.tenantId,
        type: editingPayment.type,
        amount: editingPayment.amount,
        dueDate: editingPayment.dueDate,
        paidDate: editingPayment.paidDate || '',
        notes: editingPayment.notes,
      });
    }
  }, [editingPayment]);

  const handleSave = () => {
    if (!form.propertyId || !form.tenantId || !form.type || !form.amount || !form.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    let status = 'pending';
    if (form.paidDate) status = 'paid';
    else if (form.dueDate < today) status = 'overdue';

    const data = { ...form, paidDate: form.paidDate || null, status, amount: +form.amount };

    if (editingPayment) {
      updatePayment(editingPayment.id, data);
      setEditingPayment(null);
    } else {
      addPayment(data as Omit<Payment, 'id'>);
      setIsAddOpen(false);
    }
    setForm(emptyForm);
  };

  const tenantsForProperty = form.propertyId ? tenants.filter(t => t.propertyId === form.propertyId && t.status === 'active') : [];

  const monthLabel = new Date(selectedYear, selectedMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const nonArchivedProps = properties.filter(p => p.status !== 'archived');

  // Payment form modal
  const PaymentModal = ({ isEdit }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => { setIsAddOpen(false); setEditingPayment(null); setForm(emptyForm); }} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-lg p-6 mx-4 space-y-4">
        <h2 className="text-lg font-semibold">{isEdit ? 'Edit Payment' : 'Log Payment'}</h2>
        <div>
          <label className="text-sm font-medium">Property *</label>
          <Select value={form.propertyId} onValueChange={v => setForm({ ...form, propertyId: v, tenantId: '' })}>
            <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
            <SelectContent>{nonArchivedProps.map(p => <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Tenant *</label>
          <Select value={form.tenantId} onValueChange={v => {
            const tenant = tenants.find(t => t.id === v);
            setForm({ ...form, tenantId: v, amount: form.type === 'rent' && tenant ? tenant.monthlyRent : form.amount });
          }}>
            <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
            <SelectContent>{tenantsForProperty.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Type *</label>
            <Select value={form.type} onValueChange={v => {
              const tenant = tenants.find(t => t.id === form.tenantId);
              setForm({ ...form, type: v, amount: v === 'rent' && tenant ? tenant.monthlyRent : form.amount });
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['rent', 'deposit', 'late_fee', 'partial'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><label className="text-sm font-medium">Amount *</label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium">Due Date *</label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Paid Date</label><Input type="date" value={form.paidDate} onChange={e => setForm({ ...form, paidDate: e.target.value })} /></div>
        </div>
        <div><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditingPayment(null); setForm(emptyForm); }}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Month Navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-lg font-semibold min-w-[180px] text-center">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Log Payment</Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {['all', 'paid', 'pending', 'overdue'].map(tab => (
            <button key={tab} onClick={() => setFilterStatus(tab)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors', filterStatus === tab ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {tab}
            </button>
          ))}
        </div>
        <Select value={filterPropertyId} onValueChange={setFilterPropertyId}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {nonArchivedProps.map(p => <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Expected', value: formatCurrency(summary.expected) },
          { label: 'Collected', value: formatCurrency(summary.collected) },
          { label: 'Outstanding', value: formatCurrency(summary.outstanding) },
          { label: 'Collection Rate', value: `${summary.rate}%` },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl shadow-sm border p-4 text-center">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-lg font-bold mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      {displayPayments.length === 0 ? (
        <EmptyState icon="💰" title="No payments" description="No payment records for this period." actionLabel="Log Payment" onAction={() => { setForm(emptyForm); setIsAddOpen(true); }} />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">Property</th>
              <th className="p-3 font-medium">Tenant</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Due Date</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Paid Date</th>
              <th className="p-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {displayPayments.map(p => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3">{properties.find(pr => pr.id === p.propertyId)?.address || '—'}</td>
                  <td className="p-3">{tenants.find(t => t.id === p.tenantId)?.name || '—'}</td>
                  <td className="p-3 capitalize">{p.type.replace('_', ' ')}</td>
                  <td className="p-3">{formatDate(p.dueDate)}</td>
                  <td className="p-3">{formatCurrency(p.amount)}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3">{p.paidDate ? formatDate(p.paidDate) : '—'}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {(p.status === 'pending' || p.status === 'overdue') && (
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => setConfirmPaid(p)}><Check className="h-3 w-3" /></Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setEditingPayment(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(p)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(isAddOpen || editingPayment) && <PaymentModal isEdit={!!editingPayment} />}

      <ConfirmDialog
        isOpen={!!confirmPaid}
        message={`Confirm payment of ${confirmPaid ? formatCurrency(confirmPaid.amount) : ''} from ${confirmPaid ? tenants.find(t => t.id === confirmPaid.tenantId)?.name : ''}?`}
        confirmLabel="Mark as Paid"
        confirmVariant="default"
        onConfirm={() => { if (confirmPaid) { markPaid(confirmPaid.id, new Date().toISOString().slice(0, 10), confirmPaid.amount); } setConfirmPaid(null); }}
        onCancel={() => setConfirmPaid(null)}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        message="Delete this payment record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDelete) deletePayment(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
