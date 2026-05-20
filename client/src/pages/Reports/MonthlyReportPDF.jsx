import { mockShop, mockTopProducts, mockSalesChart } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const MONTH = 'মে ২০২৬';

const summary = {
  total_sales:      331000,
  total_transactions: 84,
  total_purchase:   180000,
  total_expense:     26000,
  net_profit:       125000,
  total_due:         87450,
  cash_collected:   243550,
};

const dailySales = [
  { date: '১–৭ মে',   sales: 88000,  transactions: 22 },
  { date: '৮–১৪ মে',  sales: 79000,  transactions: 20 },
  { date: '১৫–২১ মে', sales: 95000,  transactions: 24 },
  { date: '২২–৩১ মে', sales: 69000,  transactions: 18 },
];

const expenses = [
  { category: 'দোকান ভাড়া',   amount: 12000 },
  { category: 'বিদ্যুৎ বিল',   amount:  3500 },
  { category: 'কর্মচারী বেতন', amount:  8000 },
  { category: 'অন্যান্য',       amount:  2500 },
];

export default function MonthlyReportPDF() {
  const now = new Date().toLocaleDateString('en-GB');

  return (
    <div
      id="monthly-report-content"
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="bg-primary-700 px-8 py-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{mockShop.name}</h1>
            <p className="text-primary-200 text-[0.8rem] mt-0.5">{mockShop.address}</p>
            <p className="text-primary-200 text-[0.8rem]">{mockShop.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-[0.72rem] font-medium uppercase tracking-widest">মাসিক রিপোর্ট</p>
            <p className="text-white text-xl font-extrabold mt-0.5">{MONTH}</p>
            <p className="text-primary-300 text-[0.72rem] mt-1">তৈরি: {now}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* ── Summary Cards ── */}
        <section>
          <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-gray-400 mb-4">সারসংক্ষেপ</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'মোট বিক্রয়',      value: formatCurrency(summary.total_sales),    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { label: 'নগদ আদায়',        value: formatCurrency(summary.cash_collected), color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              { label: 'বকেয়া বাকি',      value: formatCurrency(summary.total_due),      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
              { label: 'মোট ক্রয়',        value: formatCurrency(summary.total_purchase), color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
              { label: 'মোট খরচ',         value: formatCurrency(summary.total_expense),  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { label: 'নিট মুনাফা',      value: formatCurrency(summary.net_profit),     color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
            ].map(s => (
              <div key={s.label}
                style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                className="rounded-xl p-4">
                <p style={{ color: s.color }} className="text-xl font-extrabold leading-tight">{s.value}</p>
                <p className="text-[0.73rem] text-gray-500 font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Weekly breakdown ── */}
        <section>
          <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-gray-400 mb-4">সাপ্তাহিক বিক্রয়</h2>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-500 font-semibold text-[0.72rem] uppercase">সময়কাল</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-semibold text-[0.72rem] uppercase">বিক্রয়</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-semibold text-[0.72rem] uppercase">লেনদেন</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-semibold text-[0.72rem] uppercase">গড়</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{row.date}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(row.sales)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.transactions}টি</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatCurrency(Math.round(row.sales / row.transactions))}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-primary-100 bg-primary-50/50">
                  <td className="px-4 py-3 font-bold text-primary-700">মোট</td>
                  <td className="px-4 py-3 text-right font-extrabold text-primary-700">{formatCurrency(summary.total_sales)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-700">{summary.total_transactions}টি</td>
                  <td className="px-4 py-3 text-right font-bold text-primary-600">
                    {formatCurrency(Math.round(summary.total_sales / summary.total_transactions))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Two column: Top products + Expenses ── */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top products */}
          <section>
            <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-gray-400 mb-4">সেরা পণ্য</h2>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-[0.8rem]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-gray-500 font-semibold text-[0.7rem] uppercase">#</th>
                    <th className="px-4 py-2.5 text-left text-gray-500 font-semibold text-[0.7rem] uppercase">পণ্য</th>
                    <th className="px-4 py-2.5 text-right text-gray-500 font-semibold text-[0.7rem] uppercase">পরিমাণ</th>
                    <th className="px-4 py-2.5 text-right text-gray-500 font-semibold text-[0.7rem] uppercase">আয়</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTopProducts.map((p, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-4 py-2.5">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[0.65rem] font-bold inline-flex ${
                          i === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-700">{p.name}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{p.total_sold}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-800">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Expenses */}
          <section>
            <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-gray-400 mb-4">খরচের বিবরণ</h2>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-[0.8rem]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-gray-500 font-semibold text-[0.7rem] uppercase">খাত</th>
                    <th className="px-4 py-2.5 text-right text-gray-500 font-semibold text-[0.7rem] uppercase">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">{e.category}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-800">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-red-100 bg-red-50/50">
                    <td className="px-4 py-2.5 font-bold text-red-600">মোট খরচ</td>
                    <td className="px-4 py-2.5 text-right font-extrabold text-red-600">
                      {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── Profit summary bar ── */}
        <section>
          <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-gray-400 mb-4">মুনাফার হিসাব</h2>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3 text-[0.83rem]">
            {[
              { label: 'মোট বিক্রয়',   value: summary.total_sales,    color: 'text-primary-700', sign: '+' },
              { label: 'বিক্রয় খরচ (ক্রয়)', value: -summary.total_purchase, color: 'text-red-600', sign: '−' },
              { label: 'পরিচালনা খরচ', value: -summary.total_expense,  color: 'text-red-500',   sign: '−' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{row.sign} {row.label}</span>
                <span className={`font-bold ${row.color}`}>{formatCurrency(Math.abs(row.value))}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="font-extrabold text-gray-800 text-[0.9rem]">= নিট মুনাফা</span>
              <span className="font-extrabold text-primary-700 text-[1rem]">{formatCurrency(summary.net_profit)}</span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-between text-[0.72rem] text-gray-400">
          <span>{mockShop.name} · {mockShop.phone}</span>
          <span>তৈরি: {now} · HardwareHub v1.0</span>
        </div>
      </div>
    </div>
  );
}
