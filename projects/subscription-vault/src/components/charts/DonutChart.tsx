import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataItem[];
  title: string;
}

const CYCLE_COLORS: Record<string, string> = {
  weekly: '#E879F9',
  monthly: '#818CF8',
  quarterly: '#34D399',
  yearly: '#FB923C',
};

export function DonutChart({ data, title }: Props) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(217 33% 17%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
          />
          <Legend formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export { CYCLE_COLORS };
