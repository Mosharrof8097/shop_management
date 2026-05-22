import { TrendingUp, AlertTriangle, Users, DollarSign, ShoppingCart, ArrowRight, RefreshCw, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '../components/ui/Card';
import SalesBarChart from '../components/charts/SalesBarChart';
import Badge from '../components/ui/Badge';
import { reportsService } from '../services/reports';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../hooks/useAuth';

const paymentLabel   = { CASH: 'নগদ', CREDIT: 'বাকি', PARTIAL: 'আংশিক' };
const paymentVariant = { CASH: 'green', CREDIT: 'red', PARTIAL: 'yellow' };

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsService.dashboard,
    refetchInterval: 60_000,
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales-recent'],
    queryFn: () => reportsService.sales({ limit: 5 }),
  });

  const { data: topData } = useQuery({
    queryKey: ['top-products-dashboard'],
    queryFn: () => reportsService.topProducts({ limit: 5 }),
  });

  const stats      = data?.data;
  const recentSales = salesData?.data?.slice(0, 5) || [];
  const topProducts = topData?.data || [];

  // Build chart data from recent sales grouped by day (last 7 days)
  const chartData = (() => {
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    const map = {};
    (salesData?.data || []).forEach(s => {
      const d = new Date(s.saleDate);
      const key = d.toDateString();
      if (!map[key]) map[key] = { name: days[d.getDay()], sales: 0 };
      map[key].sales += Number(s.total);
    });
    return Object.values(map).slice(-7);
  })();

  if (isLoading) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-[0.82rem] text-gray-400">ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="page flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <p className="text-red-500 font-medium">সার্ভারের সাথে সংযোগ হচ্ছে না।</p>
        <p className="text-[0.8rem] text-gray-400">Server চালু আছে কিনা চেক করুন।</p>
        <button onClick={refetch} className="btn-sm btn-primary inline-flex items-center gap-1.5">
          <RefreshCw size={13} /> আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* C.4 — Subscription expiry warning banner */}
      {user?.subscriptionWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="text-[0.82rem] text-yellow-800 flex-1">{user.subscriptionWarning}</span>
          <Link to="/subscription/renew" className="text-[0.75rem] text-yellow-700 font-semibold hover:underline whitespace-nowrap">
            এখনই নবায়ন করুন →
          </Link>
        </div>
      )}

      <div>
        <h1 className="page-title">ড্যাশবোর্ড</h1>
        <p className="page-subtitle mt-0.5">আজকের ব্যবসার সারসংক্ষেপ</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="আজকের বিক্রি"
          value={formatCurrency(stats?.today?.salesTotal || 0)}
          subtitle={`${stats?.today?.salesCount || 0}টি বিক্রয়`}
          icon={<TrendingUp size={22} />}
          iconBg="bg-primary-100" iconColor="text-primary-600"
          trend={8}
        />
        <StatCard
          title="মোট বাকি"
          value={formatCurrency(stats?.totalCustomerDue || 0)}
          subtitle="সব কাস্টমার মিলিয়ে"
          icon={<Users size={22} />}
          iconBg="bg-red-100" iconColor="text-red-500"
        />
        <StatCard
          title="কম স্টক"
          value={`${stats?.lowStockCount || 0}টি পণ্য`}
          subtitle="সতর্কতার নিচে"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-amber-100" iconColor="text-amber-500"
        />
        <StatCard
          title="মাসিক আয়"
          value={formatCurrency(stats?.monthly?.profit || 0)}
          subtitle={new Date().toLocaleString('bn-BD', { month: 'long', year: 'numeric' })}
          icon={<DollarSign size={22} />}
          iconBg="bg-blue-100" iconColor="text-blue-500"
          trend={12}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="card-title">সাম্প্রতিক বিক্রি</p>
              <p className="text-[0.73rem] text-gray-400 mt-0.5">সর্বশেষ বিক্রয়ের তথ্য</p>
            </div>
            <Link to="/reports" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              বিস্তারিত <ArrowRight size={13} />
            </Link>
          </div>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingUp size={18} className="text-gray-400" />
              </div>
              <p className="text-[0.78rem] text-gray-400">এখনো কোনো বিক্রয় নেই</p>
            </div>
          ) : (
            <SalesBarChart data={chartData} />
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="card-title">সেরা পণ্য</p>
              <p className="text-[0.73rem] text-gray-400 mt-0.5">এই মাসে সবচেয়ে বেশি বিক্রি</p>
            </div>
            <Link to="/reports" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              রিপোর্ট <ArrowRight size={13} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package size={18} className="text-gray-400" />
              </div>
              <p className="text-[0.78rem] text-gray-400">এই মাসে কোনো বিক্রয় নেই</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((p, i) => {
                const maxRev = Number(topProducts[0]?.totalRevenue || 1);
                const pct    = Math.max(8, Math.round((Number(p.totalRevenue) / maxRev) * 100));
                const rankColor = [
                  'bg-amber-400',
                  'bg-gray-400',
                  'bg-orange-400',
                  'bg-primary-400',
                  'bg-primary-300',
                ][i];
                const rankLabel = ['১', '২', '৩', '৪', '৫'][i];
                return (
                  <div key={p.productId || i} className="flex items-center gap-3">
                    {/* Rank badge */}
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.65rem] font-extrabold text-white shrink-0 ${rankColor}`}>
                      {rankLabel}
                    </span>

                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[0.78rem] font-semibold text-gray-800 truncate leading-tight">
                          {p.productName}
                        </p>
                        <p className="text-[0.72rem] font-bold text-gray-700 shrink-0">
                          {formatCurrency(Number(p.totalRevenue))}
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-primary-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Qty */}
                    <span className="text-[0.68rem] text-gray-400 shrink-0 w-10 text-right">
                      {Number(p.totalSold)}পিস
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent sales */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <p className="card-title">সাম্প্রতিক বিক্রয়</p>
            <Link to="/sales/history" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              সব দেখুন <ArrowRight size={13} />
            </Link>
          </div>
          {recentSales.length === 0 ? (
            <div className="empty-state"><p className="text-[0.83rem] text-gray-400">কোনো বিক্রয় নেই</p></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <ShoppingCart size={15} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.83rem] font-semibold text-gray-800 truncate">{sale.invoiceNo}</p>
                    <p className="text-[0.73rem] text-gray-400 truncate">
                      {sale.customer?.name || sale.customerName || 'Walk-in'} · {new Date(sale.saleDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[0.85rem] font-bold text-gray-900">{formatCurrency(Number(sale.total))}</p>
                    <Badge variant={paymentVariant[sale.paymentType]}>{paymentLabel[sale.paymentType]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <p className="card-title">কম স্টক সতর্কতা</p>
            <Link to="/products" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              সব দেখুন <ArrowRight size={13} />
            </Link>
          </div>
          {!stats?.lowStockProducts?.length ? (
            <div className="empty-state">
              <div className="empty-icon"><AlertTriangle size={28} /></div>
              <p className="text-[0.83rem] font-medium text-gray-500">সব পণ্যের স্টক ঠিক আছে</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-red-50/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={15} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.83rem] font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[0.73rem] text-gray-400">{p.sku} · সর্বনিম্ন: {p.minStockAlert} {p.unit}</p>
                  </div>
                  <Badge variant="red">{p.currentStock} {p.unit}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
