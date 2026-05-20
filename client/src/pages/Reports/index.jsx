import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import SalesBarChart from '../../components/charts/SalesBarChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import Badge from '../../components/ui/Badge';
import { mockTopProducts, mockSlowProducts, mockSalesChart } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const TABS = ['বিক্রির রিপোর্ট', 'পণ্য বিশ্লেষণ', 'লাভ-ক্ষতি'];
const FILTERS = ['এই সপ্তাহ', 'এই মাস', 'এই বছর'];

export default function Reports() {
  const [tab, setTab]       = useState(0);
  const [filter, setFilter] = useState(0);

  return (
    <div className="page">
      <h1 className="page-title">রিপোর্ট ও বিশ্লেষণ</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-xl text-[0.82rem] font-semibold transition-all ${
              tab === i ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Sales Report ── */}
      {tab === 0 && (
        <div className="space-y-5">
          {/* Filter pills */}
          <div className="flex gap-2">
            {FILTERS.map((f, i) => (
              <button key={i} onClick={() => setFilter(i)}
                className={`px-4 py-1.5 rounded-xl text-[0.78rem] font-semibold transition-colors ${
                  filter === i ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'মোট বিক্রি',     value: '৳ ৩,৩১,০০০', color: 'text-primary-700', bg: 'bg-primary-50' },
              { label: 'মোট লেনদেন',    value: '৮৪টি',        color: 'text-blue-700',    bg: 'bg-blue-50'    },
              { label: 'গড় প্রতি বিক্রি', value: '৳ ৩,৯৪০',  color: 'text-purple-700',  bg: 'bg-purple-50'  },
              { label: 'সর্বোচ্চ দিনে',  value: '৳ ৬১,০০০',  color: 'text-amber-700',   bg: 'bg-amber-50'   },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4`}>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[0.73rem] text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <p className="card-title mb-5">প্রতিদিনের বিক্রি (সাপ্তাহিক)</p>
            <SalesBarChart data={mockSalesChart} />
          </div>
        </div>
      )}

      {/* ── Tab 1: Product Analytics ── */}
      {tab === 1 && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Top sellers */}
            <div className="card overflow-hidden">
              <div className="card-header bg-primary-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={15} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="card-title">সেরা বিক্রেতা পণ্য</p>
                    <p className="text-[0.7rem] text-gray-400">এই মাসে সবচেয়ে বেশি বিক্রি</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <TopProductsChart data={mockTopProducts} />
                <div className="mt-4 space-y-2">
                  {mockTopProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.68rem] font-bold text-white shrink-0 ${
                        i === 0 ? 'bg-primary-600' : i === 1 ? 'bg-primary-400' : 'bg-primary-200 text-primary-700'
                      }`}>{i + 1}</div>
                      <span className="flex-1 text-[0.8rem] text-gray-700 truncate">{p.name}</span>
                      <span className="text-[0.8rem] font-bold text-gray-800 shrink-0">{p.total_sold} পিস</span>
                      <span className="text-[0.73rem] text-gray-400 shrink-0 hidden sm:block">{formatCurrency(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slow movers */}
            <div className="card overflow-hidden">
              <div className="card-header bg-red-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrendingDown size={15} className="text-red-500" />
                  </div>
                  <div>
                    <p className="card-title">কম বিক্রির পণ্য</p>
                    <p className="text-[0.7rem] text-gray-400">এই মাসে সবচেয়ে কম চলছে</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {mockSlowProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-red-50/60 rounded-2xl border border-red-100">
                    <div>
                      <p className="text-[0.83rem] font-semibold text-gray-800">{p.name}</p>
                      <p className="text-[0.72rem] text-gray-400 mt-0.5">স্টকে আছে: {p.current_stock} পিস</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="red">{p.total_sold} বিক্রি</Badge>
                      <p className="text-[0.68rem] text-gray-400 mt-1">এই মাসে</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-2 bg-amber-50 rounded-2xl p-3.5 border border-amber-100 mt-2">
                  <span className="text-amber-500 shrink-0">💡</span>
                  <p className="text-[0.75rem] text-amber-700 leading-relaxed">এই পণ্যগুলোতে নতুন স্টক না কিনে বিদ্যমান স্টক শেষ করুন।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Profit/Loss ── */}
      {tab === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'মোট আয়',  value: '৳ ৩,৩১,০০০', sub: 'বিক্রি থেকে', color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-100', icon: <TrendingUp size={18} className="text-primary-600" /> },
              { label: 'মোট খরচ', value: '৳ ২,০৬,০০০', sub: 'ক্রয় + ব্যয়', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <TrendingDown size={18} className="text-red-500" /> },
              { label: 'নিট লাভ', value: '৳ ১,২৫,০০০', sub: 'মে ২০২৬', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: <BarChart2 size={18} className="text-blue-600" /> },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border ${s.border} p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 bg-white rounded-xl flex items-center justify-center`}>{s.icon}</div>
                  <span className="text-[0.8rem] text-gray-600 font-medium">{s.label}</span>
                </div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[0.72rem] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="card p-5 text-center text-[0.83rem] text-gray-400">
            বিস্তারিত expense tracking ও profit/loss report Phase 2-এ যোগ হবে
          </div>
        </div>
      )}
    </div>
  );
}
