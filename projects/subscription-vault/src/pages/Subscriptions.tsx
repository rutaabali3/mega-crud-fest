import { useState, useMemo, useEffect } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Subscription, Category, BillingCycle } from '@/types/subscription';
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Grid3X3, List, Search } from 'lucide-react';
import { normalizeToMonthly } from '@/utils/dateUtils';

const Subscriptions = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, toggleStatus } = useSubscriptions();
  const [view, setView] = useState<'grid' | 'table'>(() => (localStorage.getItem('sub_view') as any) || 'grid');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);

  useEffect(() => { localStorage.setItem('sub_view', view); }, [view]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let result = [...subscriptions];
    if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (filterCat !== 'all') result = result.filter(s => s.category === filterCat);
    if (filterStatus !== 'all') result = result.filter(s => s.status === filterStatus);
    if (filterCycle !== 'all') result = result.filter(s => s.billingCycle === filterCycle);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'amount') cmp = normalizeToMonthly(a.amount, a.billingCycle) - normalizeToMonthly(b.amount, b.billingCycle);
      else if (sortKey === 'renewalDate') cmp = new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [subscriptions, search, filterCat, filterStatus, filterCycle, sortKey, sortDir]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">{subscriptions.length} total</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1" /> Add Subscription
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-card/50 border-white/10" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[140px] bg-card/50 border-white/10"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="streaming">Streaming</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px] bg-card/50 border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortKey + '_' + sortDir} onValueChange={v => { const [k, d] = v.split('_'); setSortKey(k); setSortDir(d as 'asc' | 'desc'); }}>
          <SelectTrigger className="w-[160px] bg-card/50 border-white/10"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name A→Z</SelectItem>
            <SelectItem value="name_desc">Name Z→A</SelectItem>
            <SelectItem value="amount_desc">Price High→Low</SelectItem>
            <SelectItem value="amount_asc">Price Low→High</SelectItem>
            <SelectItem value="renewalDate_asc">Renewal Soonest</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          <button onClick={() => setView('grid')} className={`p-2 transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card/50 text-muted-foreground'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setView('table')} className={`p-2 transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-card/50 text-muted-foreground'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-semibold text-foreground mb-1">No subscriptions found</p>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or add a new subscription</p>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1" /> Add Your First
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <SubscriptionCard
              key={s.id}
              subscription={s}
              onEdit={(s) => { setEditing(s); setFormOpen(true); }}
              onToggle={toggleStatus}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : (
        <SubscriptionTable
          subscriptions={filtered}
          onEdit={(s) => { setEditing(s); setFormOpen(true); }}
          onToggle={toggleStatus}
          onDelete={setDeleting}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      )}

      <SubscriptionForm open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={addSubscription} onUpdate={updateSubscription} editing={editing} />

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove <strong>{deleting?.name}</strong>. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleting) deleteSubscription(deleting.id); setDeleting(null); }} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Subscriptions;
