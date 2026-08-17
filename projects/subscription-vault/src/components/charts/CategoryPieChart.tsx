import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataItem[];
}

export function CategoryPieChart({ data }: Props) {
  if (data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsPie>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`$${value.toFixed(2)}/mo (${((value / total) * 100).toFixed(0)}%)`, name]}
            contentStyle={{ backgroundColor: 'hsl(217 33% 17%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
          />
          <Legend formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
