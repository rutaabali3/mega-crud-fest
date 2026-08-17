import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Building2, DollarSign, AlertTriangle, Wrench, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function Dashboard() {
  const { properties, tenants, payments, maintenance, markPaid } = useApp();
  const [confirmPayment, setConfirmPayment] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // KPI calculations
  const activeProperties = properties.filter(p => p.status !== 'archived');
  const occupiedCount = activeProperties.filter(p => p.status === 'occupied').length;
  const vacantCount = activeProperties.filter(p => p.status === 'vacant').length;
  const activeTenants = tenants.filter(t => t.status === 'active');
  const monthlyRentDue = activeTenants.reduce((sum, t) => sum + t.monthlyRent, 0);
  const overduePayments = payments.filter(p => p.status === 'overdue');
  const overdueTotal = overduePayments.reduce((sum, p) => sum + p.amount, 0);
  const openMaintenance = maintenance.filter(m => m.status !== 'resolved');
  const emergencyCount = openMaintenance.filter(m => m.priority === 'emergency').length;

  // Rent collection this month
  const monthlyRentPayments = payments.filter(p => {
    const d = new Date(p.dueDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.type === 'rent';
  });

  // Alerts
  const alerts = useMemo(() => {
    const a: { type: string; message: string }[] = [];
    activeTenants.forEach(t => {
      const daysLeft = Math.ceil((new Date(t.leaseEnd).getTime() - now.getTime()) / 86400000);
      if (daysLeft > 0 && daysLeft <= 30) a.push({ type: 'error', message: `${t.name}'s lease expires in ${daysLeft} days` });
      else if (daysLeft > 30 && daysLeft <= 60) a.push({ type: 'warning', message: `${t.name}'s lease expires in ${daysLeft} days` });
    });
    overduePayments.forEach(p => {
      const tenant = tenants.find(t => t.id === p.tenantId);
      const prop = properties.find(pr => pr.id === p.propertyId);
      a.push({ type: 'error', message: `${formatCurrency(p.amount)} rent overdue — ${tenant?.name} at ${prop?.address}` });
    });
    maintenance.filter(m => m.priority === 'emergency' && m.status !== 'resolved').forEach(m => {
      const prop = properties.find(p => p.id === m.propertyId);
      a.push({ type: 'error', message: `Emergency: ${m.title} at ${prop?.address}` });
    });
    properties.filter(p => p.status === 'vacant').forEach(p => {
      a.push({ type: 'info', message: `${p.address} is currently vacant` });
    });
    return a;
  }, [activeTenants, overduePayments, maintenance, properties, tenants]);

  // Mini calendar
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days: { day: number; dots: { color: string; payment: typeof payments[0]; tenant: string; property: string }[] }[] = [];
    
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, dots: [] });
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayPayments = payments.filter(p => p.dueDate === dateStr && p.type === 'rent');
      const dots = dayPayments.map(p => ({
        color: p.status === 'paid' ? 'bg-success' : p.status === 'overdue' ? 'bg-destructive' : 'bg-warning',
        payment: p,
        tenant: tenants.find(t => t.id === p.tenantId)?.name || '—',
        property: properties.find(pr => pr.id === p.propertyId)?.address || '—',
      }));
      days.push({ day: d, dots });
    }
    return days;
  }, [currentYear, currentMonth, payments, tenants, properties]);

  const paymentToConfirm = confirmPayment ? payments.find(p => p.id === confirmPayment) : null;
  const confirmTenantName = paymentToConfirm ? tenants.find(t => t.id === paymentToConfirm.tenantId)?.name : '';

  const kpiCards = [
    { icon: <Building2 className="h-5 w-5 text-primary" />, label: 'Total Properties', value: activeProperties.length, sub: `${occupiedCount} occupied / ${vacantCount} vacant` },
    { icon: <DollarSign className="h-5 w-5 text-success" />, label: 'Monthly Rent Due', value: formatCurrency(monthlyRentDue), sub: 'This month' },
    { icon: <AlertTriangle className="h-5 w-5 text-destructive" />, label: 'Outstanding Payments', value: overduePayments.length, sub: <span className="text-destructive">{formatCurrency(overdueTotal)}</span> },
    { icon: <Wrench className="h-5 w-5 text-warning" />, label: 'Open Maintenance', value: openMaintenance.length, sub: emergencyCount > 0 ? <span className="text-destructive">{emergencyCount} emergency</span> : 'None critical' },
  ];

  const alertColors: Record<string, string> = { error: 'text-destructive', warning: 'text-warning', info: 'text-info' };
  const alertIcons: Record<string, string> = { error: '🔴', warning: '⚠️', info: 'ℹ️' };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-card rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              {card.icon}
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Rent Collection Table */}
          <div className="bg-card rounded-xl shadow-sm border p-5">
            <h2 className="text-base font-semibold mb-4">Rent Collection This Month</h2>
            {monthlyRentPayments.length === 0 ? (
              <EmptyState icon="💰" title="No rent due" description="No rent payments due this month." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Property</th>
                      <th className="pb-3 font-medium">Tenant</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Due Date</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRentPayments.map(p => {
                      const tenant = tenants.find(t => t.id === p.tenantId);
                      const prop = properties.find(pr => pr.id === p.propertyId);
                      return (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-3">{prop?.address}</td>
                          <td className="py-3">{tenant?.name}</td>
                          <td className="py-3">{formatCurrency(p.amount)}</td>
                          <td className="py-3">{formatDate(p.dueDate)}</td>
                          <td className="py-3"><StatusBadge status={p.status} /></td>
                          <td className="py-3">
                            {p.status === 'paid' ? (
                              <span className="flex items-center gap-1 text-success text-xs"><Check className="h-3 w-3" /> {formatDate(p.paidDate!)}</span>
                            ) : (
                              <Button size="sm" variant="outline" className="text-success border-success hover:bg-success/10" onClick={() => setConfirmPayment(p.id)}>
                                Mark Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mini Calendar */}
          <div className="bg-card rounded-xl shadow-sm border p-5">
            <h2 className="text-base font-semibold mb-4">
              {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {calendarDays.map((cell, i) => (
                <div key={i} className="relative flex flex-col items-center py-1 min-h-[36px]">
                  {cell.day > 0 && (
                    <>
                      <span className="text-xs">{cell.day}</span>
                      {cell.dots.length > 0 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex gap-0.5 mt-0.5">
                              {cell.dots.map((dot, j) => (
                                <span key={j} className={`h-1.5 w-1.5 rounded-full ${dot.color}`} />
                              ))}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 text-xs space-y-2">
                            {cell.dots.map((dot, j) => (
                              <div key={j}>
                                <div className="font-medium">{dot.tenant}</div>
                                <div className="text-muted-foreground">{dot.property}</div>
                                <div className="flex justify-between">
                                  <span>{formatCurrency(dot.payment.amount)}</span>
                                  <StatusBadge status={dot.payment.status} />
                                </div>
                              </div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-card rounded-xl shadow-sm border p-5 h-fit">
          <h2 className="text-base font-semibold mb-4">Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-success">✅ All clear — no alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm ${alertColors[alert.type]}`}>
                  <span>{alertIcons[alert.type]}</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmPayment}
        message={`Confirm payment of ${paymentToConfirm ? formatCurrency(paymentToConfirm.amount) : ''} from ${confirmTenantName}?`}
        confirmLabel="Mark as Paid"
        confirmVariant="default"
        onConfirm={() => {
          if (confirmPayment && paymentToConfirm) {
            markPaid(confirmPayment, new Date().toISOString().slice(0, 10), paymentToConfirm.amount);
          }
          setConfirmPayment(null);
        }}
        onCancel={() => setConfirmPayment(null)}
      />
    </div>
  );
}
