import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3.5 py-2.5 text-sm">
      <p className="text-gray-500 text-[0.73rem] mb-0.5">{label}</p>
      <p className="text-primary-700 font-bold text-[0.9rem]">৳ {payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function SalesBarChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<Tip />} cursor={{ fill: '#f0fdf4', radius: 8 }} />
        <Bar dataKey="sales" fill="#16a34a" radius={[6, 6, 2, 2]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
