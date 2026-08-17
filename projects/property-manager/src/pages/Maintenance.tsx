import { useState, useEffect } from 'react';
import { useApp, MaintenanceRequest } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SlideOverPanel } from '@/components/SlideOverPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categories = ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other'];
const priorities = ['low', 'medium', 'high', 'emergency'];
const emptyForm = { propertyId: '', title: '', description: '', category: '', priority: '', contractorName: '', contractorPhone: '', cost: 0, reportedDate: new Date().toISOString().slice(0, 10) };

export default function Maintenance() {
  const { properties, maintenance, addMaintenance, updateMaintenance, deleteMaintenance, updateMaintenanceStatus } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterPropertyId, setFilterPropertyId] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MaintenanceRequest | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = maintenance
    .filter(m => filterPriority === 'all' || m.priority === filterPriority)
    .filter(m => filterPropertyId === 'all' || m.propertyId === filterPropertyId);

  const columns = [
    { status: 'open', label: '🔴 Open', items: filtered.filter(m => m.status === 'open') },
    { status: 'in_progress', label: '🟡 In Progress', items: filtered.filter(m => m.status === 'in_progress') },
    { status: 'resolved', label: '✅ Resolved', items: filtered.filter(m => m.status === 'resolved') },
  ];

  useEffect(() => {
    if (editingRequest) {
      setForm({
        propertyId: editingRequest.propertyId,
        title: editingRequest.title,
        description: editingRequest.description,
        category: editingRequest.category,
        priority: editingRequest.priority,
        contractorName: editingRequest.contractorName,
        contractorPhone: editingRequest.contractorPhone,
        cost: editingRequest.cost,
        reportedDate: editingRequest.reportedDate,
      });
    }
  }, [editingRequest]);

  const handleSave = () => {
    if (!form.propertyId || !form.title || !form.description || !form.category || !form.priority) {
      toast.error('Please fill all required fields');
      return;
    }
    if (editingRequest) {
      updateMaintenance(editingRequest.id, form);
      setEditingRequest(null);
    } else {
      addMaintenance({ ...form, status: 'open', resolvedDate: null } as Omit<MaintenanceRequest, 'id'>);
      setIsAddOpen(false);
    }
    setForm(emptyForm);
  };

  const nonArchivedProps = properties.filter(p => p.status !== 'archived');

  const daysOpen = (m: MaintenanceRequest) => {
    if (m.status === 'resolved' && m.resolvedDate) {
      return Math.ceil((new Date(m.resolvedDate).getTime() - new Date(m.reportedDate).getTime()) / 86400000);
    }
    return Math.ceil((Date.now() - new Date(m.reportedDate).getTime()) / 86400000);
  };

  const RequestCard = ({ m }: { m: MaintenanceRequest }) => {
    const prop = properties.find(p => p.id === m.propertyId);
    const days = daysOpen(m);
    return (
      <div
        draggable
        onDragStart={() => setDraggedId(m.id)}
        className="bg-card rounded-lg border p-3 space-y-2 cursor-grab active:cursor-grabbing shadow-sm"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={m.priority} />
          <span className="text-xs text-muted-foreground capitalize">{m.category}</span>
        </div>
        <h4 className="text-sm font-semibold">{m.title}</h4>
        <p className="text-xs text-muted-foreground">{prop?.address}</p>
        <div className="text-xs text-muted-foreground">
          {m.status === 'resolved' ? (
            <span className="text-success">Resolved in {days} days</span>
          ) : (
            <span>Open {days} days</span>
          )}
        </div>
        <div className="text-xs">Cost: {m.cost > 0 ? formatCurrency(m.cost) : '—'} • {m.contractorName || '—'}</div>
        <div className="flex gap-1 pt-1">
          <Button size="sm" variant="ghost" onClick={() => setEditingRequest(m)}><Pencil className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(m)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {['all', ...priorities].map(p => (
            <button key={p} onClick={() => setFilterPriority(p)} className={cn('px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors', filterPriority === p ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {p}
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
        <div className="flex gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={() => setViewMode('kanban')} className={viewMode === 'kanban' ? 'bg-muted' : ''}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-muted' : ''}><List className="h-4 w-4" /></Button>
          <Button onClick={() => { setForm(emptyForm); setIsAddOpen(true); }}><Plus className="h-4 w-4 mr-1" /> New Request</Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map(col => (
            <div
              key={col.status}
              className={cn('bg-muted/50 rounded-xl p-3 min-h-[200px] transition-colors', draggedId ? 'border-2 border-dashed border-primary/30' : '')}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (draggedId) { updateMaintenanceStatus(draggedId, col.status); setDraggedId(null); }
              }}
            >
              <h3 className="font-semibold text-sm mb-3">{col.label} ({col.items.length})</h3>
              <div className="space-y-3">
                {col.items.map(m => <RequestCard key={m.id} m={m} />)}
                {col.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No items</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        filtered.length === 0 ? (
          <EmptyState icon="🔧" title="No requests" description="No maintenance requests found." actionLabel="New Request" onAction={() => { setForm(emptyForm); setIsAddOpen(true); }} />
        ) : (
          <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Property</th><th className="p-3 font-medium">Title</th><th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Priority</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Days</th>
                <th className="p-3 font-medium">Cost</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="p-3">{properties.find(p => p.id === m.propertyId)?.address}</td>
                    <td className="p-3">{m.title}</td>
                    <td className="p-3 capitalize">{m.category}</td>
                    <td className="p-3"><StatusBadge status={m.priority} /></td>
                    <td className="p-3"><StatusBadge status={m.status} /></td>
                    <td className="p-3">{daysOpen(m)}</td>
                    <td className="p-3">{m.cost > 0 ? formatCurrency(m.cost) : '—'}</td>
                    <td className="p-3 flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingRequest(m)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirmDelete(m)}><Trash2 className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <SlideOverPanel isOpen={isAddOpen || !!editingRequest} onClose={() => { setIsAddOpen(false); setEditingRequest(null); setForm(emptyForm); }} title={editingRequest ? 'Edit Request' : 'New Request'} onSave={handleSave}>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Property *</label>
            <Select value={form.propertyId} onValueChange={v => setForm({ ...form, propertyId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{nonArchivedProps.map(p => <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>)}</SelectContent></Select>
          </div>
          <div><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Description *</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Category *</label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><label className="text-sm font-medium">Priority *</label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div><label className="text-sm font-medium">Contractor Name</label><Input value={form.contractorName} onChange={e => setForm({ ...form, contractorName: e.target.value })} /></div>
          <div><label className="text-sm font-medium">Contractor Phone</label><Input type="tel" value={form.contractorPhone} onChange={e => setForm({ ...form, contractorPhone: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Cost</label><Input type="number" min={0} value={form.cost} onChange={e => setForm({ ...form, cost: +e.target.value })} /></div>
            <div><label className="text-sm font-medium">Reported Date</label><Input type="date" value={form.reportedDate} onChange={e => setForm({ ...form, reportedDate: e.target.value })} /></div>
          </div>
        </div>
      </SlideOverPanel>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        message="Delete this maintenance request? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDelete) deleteMaintenance(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
