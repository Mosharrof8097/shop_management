import { formatCurrency } from '../../utils/format';

const EXPENSE_LABEL = {
  RENT: 'দোকান ভাড়া', UTILITIES: 'বিদ্যুৎ/পানি', SALARY_WAGES: 'বেতন',
  REPAIRS: 'মেরামত', TRANSPORT: 'পরিবহন', OTHER: 'অন্যান্য',
};

const MONTH_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

// Props: shop, pl (profit-loss data), topProducts, month, year
export default function MonthlyReportPDF({ shop, pl, topProducts = [], month, year }) {
  const now       = new Date().toLocaleDateString('en-GB');
  const monthName = `${MONTH_BN[(month || 1) - 1]} ${year || new Date().getFullYear()}`;

  const income     = pl?.income   || {};
  const costs      = pl?.costs    || {};
  const profit     = pl?.profit   || {};
  const expenses   = costs.expensesByCategory || [];

  const shopName    = shop?.name    || 'HardwareHub';
  const shopAddress = shop?.address || '';
  const shopPhone   = shop?.phone   || '';

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
            <h1 className="text-xl font-extrabold tracking-tight">{shopName}</h1>
            {shopAddress && <p className="text-primary-200 text-[0.8rem] mt-0.5">{shopAddress}</p>}
            {shopPhone   && <p className="text-primary-200 text-[0.8rem]">{shopPhone}</p>}
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-[0.72rem] font-medium uppercase tracking-widest">মাসিক রিপোর্ট</p>
            <p className="text-white text-xl font-extrabold mt-0.5">{monthName}</p>
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
              { label: 'মোট বিক্রয়',  value: formatCurrency(income.totalSales    || 0), color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
              { label: 'লেনদেন সংখ্যা', value: `${income.salesCount || 0}টি`,           color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              { label: 'মোট ছাড়',     value: formatCurrency(income.totalDiscount || 0), color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { label: 'মোট ক্রয়',    value: formatCurrency(costs.totalPurchases || 0), color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
              { label: 'মোট খরচ',     value: formatCurrency(costs.totalExpenses  || 0), color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
              { label: 'নিট মুনাফা',  value: formatCurrency(profit.netProfit     || 0), color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' },
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
                  {topProducts.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-[0.75rem] text-gray-400">কোনো বিক্রি নেই</td></tr>
                  ) : topProducts.slice(0, 8).map((p, i) => (
                    <tr key={p.productId || i} className="border-t border-gray-50">
                      <td className="px-4 py-2.5">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[0.65rem] font-bold inline-flex ${
                          i === 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-700 truncate max-w-[100px]">{p.productName}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{p.totalSold || p.total_sold}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-800">{formatCurrency(p.revenue || 0)}</td>
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
                  {expenses.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-6 text-center text-[0.75rem] text-gray-400">কোনো খরচ নেই</td></tr>
                  ) : expenses.map((e, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">{EXPENSE_LABEL[e.category] || e.category}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-800">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  {expenses.length > 0 && (
                    <tr className="border-t-2 border-red-100 bg-red-50/50">
                      <td className="px-4 py-2.5 font-bold text-red-600">মোট খরচ</td>
                      <td className="px-4 py-2.5 text-right font-extrabold text-red-600">
                        {formatCurrency(costs.totalExpenses || 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── Profit summary ── */}
        <section>
          <h2 className="text-[0.78rem] font-bold uppercase tracking-widest text-gray-400 mb-4">মুনাফার হিসাব</h2>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3 text-[0.83rem]">
            {[
              { label: 'মোট বিক্রয়',        value: income.totalSales    || 0, color: 'text-primary-700', sign: '+' },
              { label: 'বিক্রয় খরচ (ক্রয়)', value: costs.totalPurchases || 0, color: 'text-red-600',     sign: '−' },
              { label: 'পরিচালনা খরচ',       value: costs.totalExpenses  || 0, color: 'text-red-500',     sign: '−' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{row.sign} {row.label}</span>
                <span className={`font-bold ${row.color}`}>{formatCurrency(Math.abs(row.value))}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="font-extrabold text-gray-800 text-[0.9rem]">= নিট মুনাফা</span>
              <span className={`font-extrabold text-[1rem] ${(profit.netProfit || 0) >= 0 ? 'text-primary-700' : 'text-red-600'}`}>
                {formatCurrency(profit.netProfit || 0)}
              </span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-between text-[0.72rem] text-gray-400">
          <span>{shopName}{shopPhone ? ` · ${shopPhone}` : ''}</span>
          <span>তৈরি: {now} · HardwareHub v1.0</span>
        </div>
      </div>
    </div>
  );
}
