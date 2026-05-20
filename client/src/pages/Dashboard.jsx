import { TrendingUp, AlertTriangle, Users, DollarSign, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/ui/Card';
import SalesBarChart from '../components/charts/SalesBarChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import Badge from '../components/ui/Badge';
import {
  mockDashboardStats, mockSales, mockSalesChart,
  mockTopProducts, mockProducts,
} from '../data/mockData';
import { formatCurrency } from '../utils/format';

const lowStock = mockProducts.filter(p => p.current_stock <= p.min_stock_alert);

const paymentLabel = { CASH: 'নগদ', CREDIT: 'বাকি', PARTIAL: 'আংশিক' };
const paymentVariant = { CASH: 'green', CREDIT: 'red', PARTIAL: 'yellow' };

export default function Dashboard() {
  return (
    <div className="page">
      {/* Page header */}
      <div>
        <h1 className="page-title">ড্যাশবোর্ড</h1>
        <p className="page-subtitle mt-0.5">আজকের ব্যবসার সারসংক্ষেপ</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="আজকের বিক্রি"
          value={formatCurrency(mockDashboardStats.today_sales)}
          subtitle={`${mockDashboardStats.today_sales_count}টি বিক্রয়`}
          icon={<TrendingUp size={22} />}
          iconBg="bg-primary-100"
          iconColor="text-primary-600"
          trend={8}
        />
        <StatCard
          title="মোট বাকি"
          value={formatCurrency(mockDashboardStats.total_due)}
          subtitle="সব কাস্টমার মিলিয়ে"
          icon={<Users size={22} />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
        />
        <StatCard
          title="কম স্টক"
          value={`${lowStock.length}টি পণ্য`}
          subtitle="সতর্কতার নিচে"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-amber-100"
          iconColor="text-amber-500"
        />
        <StatCard
          title="মাসিক আয়"
          value={formatCurrency(mockDashboardStats.monthly_profit)}
          subtitle="মে ২০২৬"
          icon={<DollarSign size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
          trend={12}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Weekly sales — wider */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="card-title">সাপ্তাহিক বিক্রি</p>
              <p className="text-[0.73rem] text-gray-400 mt-0.5">এই সপ্তাহের প্রতিদিনের বিক্রয়</p>
            </div>
            <Link to="/reports" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              বিস্তারিত <ArrowRight size={13} />
            </Link>
          </div>
          <SalesBarChart data={mockSalesChart} />
        </div>

        {/* Top products — narrower */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="card-title">সেরা পণ্য</p>
              <p className="text-[0.73rem] text-gray-400 mt-0.5">এই মাসে সবচেয়ে বেশি বিক্রি</p>
            </div>
          </div>
          <TopProductsChart data={mockTopProducts.slice(0, 5)} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent sales */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <div>
              <p className="card-title">সাম্প্রতিক বিক্রয়</p>
            </div>
            <Link to="/sales/history" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              সব দেখুন <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {mockSales.map(sale => (
              <div key={sale.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <ShoppingCart size={15} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.83rem] font-semibold text-gray-800 truncate">{sale.invoice_no}</p>
                  <p className="text-[0.73rem] text-gray-400 truncate">{sale.customer} · {sale.sale_date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[0.85rem] font-bold text-gray-900">{formatCurrency(sale.total)}</p>
                  <Badge variant={paymentVariant[sale.payment_type]}>
                    {paymentLabel[sale.payment_type]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <div>
              <p className="card-title">কম স্টক সতর্কতা</p>
            </div>
            <Link to="/products" className="text-[0.75rem] text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              সব দেখুন <ArrowRight size={13} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><AlertTriangle size={28} /></div>
              <p className="text-[0.83rem] font-medium text-gray-500">সব পণ্যের স্টক ঠিক আছে</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-red-50/40 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={15} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.83rem] font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[0.73rem] text-gray-400">{p.sku} · সর্বনিম্ন: {p.min_stock_alert} {p.unit}</p>
                  </div>
                  <Badge variant="red">{p.current_stock} {p.unit}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
