import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export default function TopProductsChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 4, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }}
          axisLine={false} tickLine={false} width={72} />
        <Tooltip
          formatter={val => [`${val} পিস`, 'বিক্রি']}
          contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #f0fdf4' }}
        />
        <Bar dataKey="total_sold" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
