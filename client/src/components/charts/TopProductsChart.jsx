import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#f97316','#fb923c','#fdba74','#fed7aa','#ffedd5'];

export default function TopProductsChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${v}`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          formatter={(val) => [`${val} পিস`, 'বিক্রি']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="total_sold" radius={[0, 6, 6, 0]} maxBarSize={24}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
