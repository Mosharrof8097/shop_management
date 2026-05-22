import { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SalesBarChart from '../../components/charts/SalesBarChart';
import TopProductsChart from '../../components/charts/TopProductsChart';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import MonthlyReportPDF from './MonthlyReportPDF';
import { reportsService } from '../../services/reports';
import { formatCurrency } from '../../utils/format';
import { exportElementAsPDF } from '../../utils/pdf';
import { useAuth } from '../../hooks/useAuth';

const TABS    = ['বিক্রির রিপোর্ট', 'পণ্য বিশ্লেষণ', 'মাসিক রিপোর্ট'];
const FILTERS = [
  { label: 'এই সপ্তাহ', days: 7 },
  { label: 'এই মাস',    days: 30 },
  { label: 'এই বছর',   days: 365 },
];

function dateRange(days) {
  const to   = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  return { from, to };
}

export default function Reports() {
  const { user } = useAuth();
  const [tab,       setTab]       = useState(0);
  const [filter,    setFilter]    = useState(1);
  const [exporting, setExporting] = useState(false);

  const now   = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();
  const range = dateRange(FILTERS[filter].days);

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', filter],
    queryFn: () => reportsService.sales({ ...range, groupBy: filter === 2 ? 'month' : 'day' }),
  });

  const { data: topData } = useQuery({
    queryKey: ['report-top', filter],
    queryFn: () => reportsService.topProducts({ ...range, limit: 10 }),
  });

  const { data: slowData } = useQuery({
    queryKey: ['report-slow', filter],
    queryFn: () => reportsService.slowProducts({ ...range, limit: 10 }),
  });

  const { data: plData } = useQuery({
    queryKey: ['report-pl', month, year],
    queryFn: () => reportsService.profitLoss({ month, year }),
  });

  const salesTotals  = salesData?.totals  || {};
  const chartData    = (salesData?.chart  || []).map(c => ({ name: c.period.slice(-5), sales: c.total }));
  const topProducts  = topData?.data      || [];
  const slowProducts = slowData?.data     || [];
  const pl           = plData?.data       || {};

  const handleExportPDF = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 100));
    await exportElementAsPDF('monthly-report-content', `মাসিক-রিপোর্ট-${year}-${String(month).padStart(2,'0')}.pdf`);
    setExporting(false);
  };

  return (
    <div className="page">
      <h1 className="page-title">রিপোর্ট ও বিশ্লেষণ</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-xl text-[0.82rem] font-semibold transition-all ${
              tab === i ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Tab 0: Sales Report ── */}
      {tab === 0 && (
        <div className="space-y-5">
          <div className="flex gap-2">
            {FILTERS.map((f, i) => (
              <button key={i} onClick={() => setFilter(i)}
                className={`px-4 py-1.5 rounded-xl text-[0.78rem] font-semibold transition-colors ${
                  filter === i ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}>{f.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'মোট বিক্রি',    value: formatCurrency(salesTotals.totalSales   || 0), color: 'text-primary-700', bg: 'bg-primary-50' },
              { label: 'মোট লেনদেন',   value: `${salesTotals.count || 0}টি`,               color: 'text-blue-700',    bg: 'bg-blue-50'    },
              { label: 'মোট বাকি',      value: formatCurrency(salesTotals.totalDue     || 0), color: 'text-red-700',     bg: 'bg-red-50'     },
              { label: 'মোট ছাড়',       value: formatCurrency(salesTotals.totalDiscount|| 0), color: 'text-amber-700',   bg: 'bg-amber-50'   },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3`}>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[0.72rem] text-gray-500 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <p className="card-title mb-4">বিক্রির চার্ট</p>
            {salesLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : <SalesBarChart data={chartData} />}
          </div>
        </div>
      )}

      {/* ── Tab 1: Product Analytics ── */}
      {tab === 1 && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Top selling */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <p className="card-title">সেরা বিক্রির পণ্য</p>
                <Badge variant="green">Top 10</Badge>
              </div>
              <div className="divide-y divide-gray-50">
                {topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[0.72rem] font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.83rem] font-semibold text-gray-800 truncate">{p.productName}</p>
                      <p className="text-[0.7rem] text-gray-400">{p.productSku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[0.83rem] font-bold text-primary-700">{formatCurrency(Number(p.totalRevenue))}</p>
                      <p className="text-[0.7rem] text-gray-400">{p.totalSold} বিক্রি</p>
                    </div>
                  </div>
                ))}
                {!topProducts.length && <div className="empty-state"><p className="text-gray-400 text-[0.82rem]">কোনো তথ্য নেই</p></div>}
              </div>
            </div>

            {/* Slow movers */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <p className="card-title">কম বিক্রির পণ্য</p>
                <Badge variant="yellow">মনোযোগ দিন</Badge>
              </div>
              <div className="divide-y divide-gray-50">
                {slowProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-amber-50/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.83rem] font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[0.7rem] text-gray-400">স্টক: {p.currentStock} {p.unit}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="yellow">{p.totalSold} বিক্রি</Badge>
                    </div>
                  </div>
                ))}
                {!slowProducts.length && <div className="empty-state"><p className="text-gray-400 text-[0.82rem]">কোনো তথ্য নেই</p></div>}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card p-5">
            <p className="card-title mb-4">সেরা পণ্য চার্ট</p>
            <TopProductsChart data={topProducts.slice(0, 5).map(p => ({ name: p.productName, sales: Number(p.totalRevenue) }))} />
          </div>
        </div>
      )}

      {/* ── Tab 2: Monthly Report ── */}
      {tab === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{now.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })} রিপোর্ট</p>
              <p className="text-[0.75rem] text-gray-400 mt-0.5">আয়, ব্যয় ও মুনাফার সারসংক্ষেপ</p>
            </div>
            <Button icon={exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              onClick={handleExportPDF} disabled={exporting}>
              {exporting ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
            </Button>
          </div>

          {/* P&L Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'মোট বিক্রি',     value: formatCurrency(pl.income?.totalSales    || 0), icon: <TrendingUp size={18}/>,   color: 'text-primary-700', bg: 'bg-primary-50' },
              { label: 'ক্রয় খরচ',      value: formatCurrency(pl.costs?.totalPurchases || 0), icon: <TrendingDown size={18}/>, color: 'text-blue-700',    bg: 'bg-blue-50'    },
              { label: 'মোট খরচ',        value: formatCurrency(pl.costs?.totalExpenses  || 0), icon: <TrendingDown size={18}/>, color: 'text-red-700',     bg: 'bg-red-50'     },
              { label: 'নিট মুনাফা',     value: formatCurrency(pl.profit?.netProfit     || 0), icon: <TrendingUp size={18}/>,   color: (pl.profit?.netProfit || 0) >= 0 ? 'text-primary-700' : 'text-red-700', bg: (pl.profit?.netProfit || 0) >= 0 ? 'bg-primary-50' : 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3`}>
                <span className={s.color}>{s.icon}</span>
                <div>
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[0.72rem] text-gray-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expense breakdown */}
          {pl.costs?.expensesByCategory?.length > 0 && (
            <div className="card p-5">
              <p className="card-title mb-4">খরচের বিভাগ</p>
              <div className="space-y-2">
                {pl.costs.expensesByCategory.map(e => (
                  <div key={e.category} className="flex items-center justify-between text-[0.83rem]">
                    <span className="text-gray-600">{e.category}</span>
                    <span className="font-bold text-gray-800">{formatCurrency(Number(e.amount))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden PDF template */}
          <div className="sr-only">
            <MonthlyReportPDF shop={user?.shop} pl={pl} topProducts={topProducts} month={month} year={year} />
          </div>
        </div>
      )}
    </div>
  );
}
