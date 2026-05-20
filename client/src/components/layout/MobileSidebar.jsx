import { NavLink } from 'react-router-dom';
import { X, Leaf, LayoutDashboard, Package, ShoppingCart, Users, Truck, BarChart2, Settings, LogOut } from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { to: '/products',  icon: Package,         label: 'পণ্য ও স্টক' },
  { to: '/sales',     icon: ShoppingCart,    label: 'বিক্রি / POS' },
  { to: '/customers', icon: Users,           label: 'কাস্টমার' },
  { to: '/purchases', icon: Truck,           label: 'ক্রয়' },
  { to: '/reports',   icon: BarChart2,       label: 'রিপোর্ট' },
  { to: '/settings',  icon: Settings,        label: 'সেটিংস' },
];

export default function MobileSidebar({ open, onClose, onLogout, shopName }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-72 bg-sidebar flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Leaf size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[0.9rem] leading-tight">{shopName || 'HardwareHub'}</p>
              <p className="text-green-400 text-[0.68rem]">ম্যানেজমেন্ট সিস্টেম</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-green-400 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : 'nav-item-idle'}`}>
              {({ isActive }) => (
                <><Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" /><span>{label}</span></>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6 border-t border-white/5 pt-3">
          <button onClick={onLogout} className="nav-item nav-item-idle w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={16} className="shrink-0" /><span>লগআউট</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
