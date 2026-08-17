import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Download, Printer } from 'lucide-react';

export default function Reports() {
  const { properties, tenants, payments, maintenance, expenses, exportData } = useApp();
  const now = new Date();
  const [activeReport, setActiveReport] = useState<'monthly' | 'annual' | 'comparison'>('monthly');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');

  const nonArchivedProps = properties.filter(p => p.status !== 'archived');

  const getMonthlyIncome = (year: number, month: number, propId: string) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    return payments
      .filter(p => p.status === 'paid' && p.paidDate?.startsWith(monthStr))
      .filter(p => propId === 'all' || p.propertyId === propId)
      .reduce((s, p) => s + p.amount, 0);
  };

  const getMonthlyExpenses = (year: number, month: number, propId: string) => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const exp = expenses
      .filter(e => e.date.startsWith(monthStr))
      .filter(e => propId === 'all' || e.propertyId === propId)
      .reduce((s, e) => s + e.amount, 0);
    const maint = maintenance
      .filter(m => m.resolvedDate?.startsWith(monthStr) && m.cost > 0)
      .filter(m => propId === 'all' || m.propertyId === propId)
      .reduce((s, m) => s + m.cost, 0);
    const mortgage = (propId === 'all' ? nonArchivedProps : nonArchivedProps.filter(p => p.id === propId))
      .reduce((s, p) => s + p.monthlyMortgage, 0);
    return exp + maint + mortgage;
  };

  // Monthly P&L
  const monthlyIncome = getMonthlyIncome(selectedYear, selectedMonth, selectedPropertyId);
  const monthlyExpenses = getMonthlyExpenses(selectedYear, selectedMonth, selectedPropertyId);
  const monthlyNOI = monthlyIncome - monthlyExpenses;
  const noiMargin = monthlyIncome > 0 ? ((monthlyNOI / monthlyIncome) * 100).toFixed(1) + '%' : '—';

  // Last 6 months chart data
  const last6Months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(selectedYear, selectedMonth - 5 + i);
      const y = d.getFullYear();
      const m = d.getMonth();
      return {
        name: d.toLocaleString('en-US', { month: 'short' }),
        income: getMonthlyIncome(y, m, selectedPropertyId),
        expenses: getMonthlyExpenses(y, m, selectedPropertyId),
      };
    });
  }, [selectedYear, selectedMonth, selectedPropertyId, payments, expenses, maintenance]);

  // Annual data
  const annualData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const inc = getMonthlyIncome(selectedYear, i, 'all');
      const exp = getMonthlyExpenses(selectedYear, i, 'all');
      return { name: new Date(2000, i).toLocaleString('en-US', { month: 'short' }), income: inc, expenses: exp, noi: inc - exp };
    });
  }, [selectedYear, payments, expenses, maintenance]);

  const annualIncome = annualData.reduce((s, d) => s + d.income, 0);
  const annualExpense = annualData.reduce((s, d) => s + d.expenses, 0);
  const bestMonth = annualData.reduce((best, d) => d.noi > best.noi ? d : best, annualData[0]);

  // Property comparison
  const comparisonData = useMemo(() => {
    return nonArchivedProps.map(prop => {
      const income = payments.filter(p => p.propertyId === prop.id && p.status === 'paid' && p.paidDate?.startsWith(String(selectedYear))).reduce((s, p) => s + p.amount, 0);
      const exp = expenses.filter(e => e.propertyId === prop.id && e.date.startsWith(String(selectedYear))).reduce((s, e) => s + e.amount, 0);
      const maintCost = maintenance.filter(m => m.propertyId === prop.id && m.resolvedDate?.startsWith(String(selectedYear))).reduce((s, m) => s + m.cost, 0);
      const totalExp = exp + maintCost + prop.monthlyMortgage * 12;
      const noi = income - totalExp;
      const hasActive = tenants.some(t => t.propertyId === prop.id && t.status === 'active');
      return { address: prop.address, income, expenses: totalExp, noi, occupancy: hasActive ? '100%' : '0%', vacancyDays: hasActive ? 0 : 365 };
    });
  }, [nonArchivedProps, payments, expenses, maintenance, tenants, selectedYear]);

  const yearOptions = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 3 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }) }));

  const reportTabs = [
    { key: 'monthly' as const, label: '📅 Monthly P&L' },
    { key: 'annual' as const, label: '📈 Annual Overview' },
    { key: 'comparison' as const, label: '🏢 Property Comparison' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {reportTabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveReport(tab.key)} className={cn('px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors', activeReport === tab.key ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeReport === 'monthly' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(+v)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(+v)}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {nonArchivedProps.map(p => <SelectItem key={p.id} value={p.id}>{p.address}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Gross Income', value: formatCurrency(monthlyIncome) },
              { label: 'Total Expenses', value: formatCurrency(monthlyExpenses) },
              { label: 'Net Operating Income', value: formatCurrency(monthlyNOI) },
              { label: 'NOI Margin', value: noiMargin },
            ].map(c => (
              <div key={c.label} className="bg-card rounded-xl shadow-sm border p-4">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-lg font-bold mt-1">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold mb-4">Income vs Expenses (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="income" fill="hsl(217, 91%, 60%)" name="Income" />
                <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === 'annual' && (
        <div className="space-y-6">
          <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(+v)}>
            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Annual Income', value: formatCurrency(annualIncome) },
              { label: 'Annual Expenses', value: formatCurrency(annualExpense) },
              { label: 'Annual NOI', value: formatCurrency(annualIncome - annualExpense) },
              { label: 'Best Month', value: bestMonth.name },
            ].map(c => (
              <div key={c.label} className="bg-card rounded-xl shadow-sm border p-4">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-lg font-bold mt-1">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold mb-4">Monthly Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="hsl(217, 91%, 60%)" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="hsl(0, 72%, 51%)" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground">
                <th className="p-3 font-medium">Property</th><th className="p-3 font-medium">Annual Income</th><th className="p-3 font-medium">Annual Expenses</th>
                <th className="p-3 font-medium">NOI</th><th className="p-3 font-medium">Occupancy</th><th className="p-3 font-medium">Vacancy Days</th>
              </tr></thead>
              <tbody>
                {comparisonData.map(c => (
                  <tr key={c.address} className="border-b last:border-0">
                    <td className="p-3">{c.address}</td>
                    <td className="p-3">{formatCurrency(c.income)}</td>
                    <td className="p-3">{formatCurrency(c.expenses)}</td>
                    <td className={cn('p-3 font-medium', c.noi >= 0 ? 'text-success' : 'text-destructive')}>{formatCurrency(c.noi)}</td>
                    <td className="p-3">{c.occupancy}</td>
                    <td className="p-3">{c.vacancyDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold mb-4">NOI by Property</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="address" type="category" width={200} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="noi" name="NOI" fill="hsl(142, 72%, 29%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-3 no-print">
        <Button variant="outline" onClick={exportData}><Download className="h-4 w-4 mr-1" /> Export JSON Backup</Button>
        <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Print Report</Button>
      </div>
    </div>
  );
}
