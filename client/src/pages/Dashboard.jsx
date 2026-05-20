import { TrendingUp, AlertTriangle, Users, ShoppingBag } from 'lucide-react';
import { StatCard } from '../components/ui/Card';
import SalesBarChart from '../components/charts/SalesBarChart';
import TopProductsChart from '../components/charts/TopProductsChart';
import Badge from '../components/ui/Badge';
import { mockDashboardStats, mockSales, mockSalesChart, mockTopProducts, mockProducts } from '../data/mockData';
import { formatCurrency } from '../utils/format';

const lowStockProducts = mockProducts.filter(p => p.current_stock <= p.min_stock_alert);

export default function Dashboard() {
  return (
    <div className="page-container space-y-6 pt-4">
      <div>
        <h2 className="section-title">ড্যাশবোর্ড</h2>
        <p className="text-sm text-gray-500 -mt-3">আজকের সারসংক্ষেপ</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="আজকের বিক্রি"
          value={formatCurrency(mockDashboardStats.today_sales)}
          subtitle={`${mockDashboardStats.today_sales_count}টি বিক্রি`}
          icon={<TrendingUp size={22} />}
          color="orange"
          trend={8}
        />
        <StatCard
          title="মোট বাকি"
          value={formatCurrency(mockDashboardStats.total_due)}
          subtitle="সব কাস্টমার মিলিয়ে"
          icon={<Users size={22} />}
          color="red"
        />
        <StatCard
          title="কম স্টক"
          value={`${lowStockProducts.length}টি পণ্য`}
          subtitle="সতর্কতার নিচে"
          icon={<AlertTriangle size={22} />}
          color="blue"
        />
        <StatCard
          title="মাসিক লাভ"
          value={formatCurrency(mockDashboardStats.monthly_profit)}
          subtitle="এই মাসে"
          icon={<ShoppingBag size={22} />}
          color="green"
          trend={12}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weekly sales chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">এই সপ্তাহের বিক্রি</h3>
          <SalesBarChart data={mockSalesChart} />
        </div>

        {/* Top products chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">সেরা বিক্রেতা পণ্য</h3>
          <TopProductsChart data={mockTopProducts} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">সাম্প্রতিক বিক্রি</h3>
            <a href="/sales" className="text-xs text-primary-600 font-medium hover:underline">সব দেখুন</a>
          </div>
          <div className="space-y-3">
            {mockSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{sale.invoice_no}</p>
                  <p className="text-xs text-gray-400">{sale.customer} · {sale.sale_date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</p>
                  <Badge variant={sale.payment_type === 'CASH' ? 'green' : sale.payment_type === 'CREDIT' ? 'red' : 'yellow'}>
                    {sale.payment_type === 'CASH' ? 'নগদ' : sale.payment_type === 'CREDIT' ? 'বাকি' : 'আংশিক'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">কম স্টক সতর্কতা</h3>
            <a href="/products" className="text-xs text-primary-600 font-medium hover:underline">স্টক দেখুন</a>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">সব পণ্যের স্টক ঠিক আছে ✅</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="red">{p.current_stock} {p.unit}</Badge>
                    <p className="text-xs text-gray-400 mt-0.5">সর্বনিম্ন: {p.min_stock_alert}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
