import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Truck, BarChart2, Settings, LogOut, Leaf,
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { to: '/products',  icon: Package,         label: 'পণ্য ও স্টক' },
  { to: '/sales',     icon: ShoppingCart,    label: 'বিক্রি / POS' },
  { to: '/customers', icon: Users,           label: 'কাস্টমার' },
  { to: '/purchases', icon: Truck,           label: 'ক্রয়' },
  { to: '/reports',   icon: BarChart2,       label: 'রিপোর্ট' },
  { to: '/settings',  icon: Settings,        label: 'সেটিংস' },
];

export default function Sidebar({ shopName, onLogout }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-sidebar h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
            <Leaf size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-[0.92rem] leading-tight truncate">
              {shopName || 'HardwareHub'}
            </p>
            <p className="text-green-400 text-[0.7rem] font-medium mt-0.5">ম্যানেজমেন্ট সিস্টেম</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[0.65rem] text-green-600/70 font-bold uppercase tracking-widest px-3 mb-2">মেনু</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : 'nav-item-idle'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-white/5 pt-3">
        <button
          onClick={onLogout}
          className="nav-item nav-item-idle w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} className="shrink-0" />
          <span>লগআউট</span>
        </button>
      </div>
    </aside>
  );
}
