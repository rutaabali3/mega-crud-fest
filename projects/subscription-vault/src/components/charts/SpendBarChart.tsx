import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DataItem {
  month: string;
  amount: number;
}

interface Props {
  data: DataItem[];
}

export function SpendBarChart({ data }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Monthly Spend (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="hsl(215 20% 65%)" fontSize={12} />
          <YAxis stroke="hsl(215 20% 65%)" fontSize={12} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(217 33% 17%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spend']}
          />
          <Bar dataKey="amount" fill="hsl(263 70% 58%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
