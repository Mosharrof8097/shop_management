import { useState } from 'react';
import { BarChart2, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import SalesBarChart from '../../components/charts/SalesBarChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import Badge from '../../components/ui/Badge';
import { mockTopProducts, mockSlowProducts, mockSalesChart } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';

const tabs = ['বিক্রির রিপোর্ট', 'পণ্য বিশ্লেষণ', 'লাভ-ক্ষতি'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="page-container space-y-4 pt-4">
      <h2 className="section-title">রিপোর্ট ও বিশ্লেষণ</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === i ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sales Report Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['এই সপ্তাহ', 'এই মাস', 'এই বছর'].map(f => (
              <button key={f} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors">{f}</button>
            ))}
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">সাপ্তাহিক বিক্রি</h3>
            <SalesBarChart data={mockSalesChart} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'মোট বিক্রি', value: '৳ ৩,৩১,০০০', color: 'text-green-600' },
              { label: 'মোট লেনদেন', value: '৮৪টি', color: 'text-blue-600' },
              { label: 'গড় বিক্রি', value: '৳ ৩,৯৪০', color: 'text-purple-600' },
              { label: 'সর্বোচ্চ দিন', value: '৳ ৬১,০০০', color: 'text-orange-600' },
            ].map(stat => (
              <div key={stat.label} className="card p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Analytics Tab */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Top sellers */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700">সেরা বিক্রেতা পণ্য</h3>
              </div>
              <TopProductsChart data={mockTopProducts} />
              <div className="mt-3 space-y-2">
                {mockTopProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-gray-700">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800">{p.total_sold} পিস</span>
                      <span className="text-xs text-gray-400 ml-2">{formatCurrency(p.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slow movers */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-red-500" />
                <h3 className="text-sm font-semibold text-gray-700">কম বিক্রির পণ্য</h3>
              </div>
              <div className="space-y-3">
                {mockSlowProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">স্টকে আছে: {p.current_stock}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="red">{p.total_sold} পিস বিক্রি</Badge>
                      <p className="text-xs text-gray-400 mt-1">এই মাসে</p>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-yellow-50 rounded-xl text-xs text-yellow-700">
                  💡 এই পণ্যগুলোতে অতিরিক্ত স্টক না রাখাই ভালো
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit/Loss Tab */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'মোট আয়', value: '৳ ৩,৩১,০০০', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'মোট খরচ', value: '৳ ২,০৬,০০০', color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'নিট লাভ', value: '৳ ১,২৫,০০০', color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(s => (
              <div key={s.label} className={`card p-4 ${s.bg}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">মে ২০২৬</p>
              </div>
            ))}
          </div>
          <div className="card p-4 text-sm text-gray-500 text-center">
            বিস্তারিত profit/loss report Phase 2-এ যোগ হবে (real API data সহ)
          </div>
        </div>
      )}
    </div>
  );
}
