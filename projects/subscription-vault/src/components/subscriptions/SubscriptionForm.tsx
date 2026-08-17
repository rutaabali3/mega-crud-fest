import { useState, useEffect } from 'react';
import { Subscription, BillingCycle, Category, Currency } from '@/types/subscription';
import { CATEGORY_CONFIG, CATEGORIES, CURRENCY_SYMBOLS } from '@/utils/categoryConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Subscription, 'id' | 'createdAt' | 'lastEditedAt' | 'color'>) => void;
  onUpdate?: (id: string, data: Partial<Subscription>) => void;
  editing?: Subscription | null;
}

const CYCLES: BillingCycle[] = ['weekly', 'monthly', 'quarterly', 'yearly'];
const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'PKR'];

export function SubscriptionForm({ open, onClose, onSave, onUpdate, editing }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<Category>('software');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [renewalDate, setRenewalDate] = useState<Date>();
  const [logoUrl, setLogoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAmount(String(editing.amount));
      setCycle(editing.billingCycle);
      setCategory(editing.category);
      setCurrency(editing.currency);
      setRenewalDate(new Date(editing.renewalDate));
      setLogoUrl(editing.logoUrl || '');
      setNotes(editing.notes || '');
      setStatus(editing.status);
    } else {
      setName(''); setAmount(''); setCycle('monthly'); setCategory('software');
      setCurrency('USD'); setRenewalDate(undefined); setLogoUrl(''); setNotes(''); setStatus('active');
    }
    setErrors({});
  }, [editing, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Enter a valid amount';
    if (!renewalDate) e.date = 'Pick a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = {
      name: name.trim(),
      amount: Number(amount),
      billingCycle: cycle,
      category,
      renewalDate: renewalDate!.toISOString(),
      logoUrl: logoUrl || undefined,
      currency,
      notes: notes || undefined,
      status,
    };
    if (editing && onUpdate) {
      onUpdate(editing.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="glass-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{editing ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogDescription>
            {editing ? `Last edited: ${format(new Date(editing.lastEditedAt), 'PPp')}` : 'Add a new subscription to track'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Netflix" className="bg-background/50 border-white/10" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Amount + Currency */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Amount *</label>
            <div className="flex gap-2">
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="9.99" className="bg-background/50 border-white/10 font-mono flex-1" />
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setCurrency(c)} className={`px-3 py-2 text-xs font-medium transition-colors ${currency === c ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-muted-foreground hover:text-foreground'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Billing Cycle</label>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {CYCLES.map(c => (
                <button key={c} onClick={() => setCycle(c)} className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${cycle === c ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-muted-foreground hover:text-foreground'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(c => {
                const meta = CATEGORY_CONFIG[c];
                return (
                  <button key={c} onClick={() => setCategory(c)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all text-xs ${category === c ? 'border-primary bg-primary/10 text-foreground' : 'border-white/10 text-muted-foreground hover:border-white/20'}`}>
                    <span className="text-lg">{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Renewal Date */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Renewal Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start bg-background/50 border-white/10', !renewalDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {renewalDate ? format(renewalDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={renewalDate} onSelect={setRenewalDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
          </div>

          {/* Logo URL */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Logo URL (optional)</label>
            <div className="flex gap-2 items-center">
              <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="bg-background/50 border-white/10 flex-1" />
              {logoUrl ? (
                <img src={logoUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: CATEGORY_CONFIG[category].color + '30', color: CATEGORY_CONFIG[category].color }}>
                  {name.slice(0, 2).toUpperCase() || '??'}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Notes (optional)</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes..." className="bg-background/50 border-white/10 min-h-[60px]" />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Status</label>
            <button onClick={() => setStatus(s => s === 'active' ? 'paused' : 'active')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${status === 'active' ? 'bg-accent/20 text-accent' : 'bg-amber-500/20 text-amber-400'}`}>
              {status === 'active' ? '✓ Active' : '⏸ Paused'}
            </button>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90">
            {editing ? 'Update Subscription' : 'Add Subscription'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
