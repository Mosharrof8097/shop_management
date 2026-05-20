import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Truck, BarChart2, Settings, LogOut, Wrench,
} from 'lucide-react';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { to: '/products', icon: Package,         label: 'পণ্য ও স্টক' },
  { to: '/sales',    icon: ShoppingCart,    label: 'বিক্রি (POS)' },
  { to: '/customers',icon: Users,           label: 'কাস্টমার' },
  { to: '/purchases',icon: Truck,           label: 'ক্রয়' },
  { to: '/reports',  icon: BarChart2,       label: 'রিপোর্ট' },
  { to: '/settings', icon: Settings,        label: 'সেটিংস' },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="bg-primary-500 p-2 rounded-lg">
          <Wrench size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">HardwareHub</p>
          <p className="text-xs text-slate-400">দোকান ম্যানেজমেন্ট</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-700 pt-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          লগআউট
        </button>
      </div>
    </aside>
  );
}
