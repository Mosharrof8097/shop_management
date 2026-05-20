import { NavLink } from 'react-router-dom';
import { X, Wrench, LayoutDashboard, Package, ShoppingCart, Users, Truck, BarChart2, Settings, LogOut } from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'ড্যাশবোর্ড' },
  { to: '/products',  icon: Package,         label: 'পণ্য ও স্টক' },
  { to: '/sales',     icon: ShoppingCart,    label: 'বিক্রি (POS)' },
  { to: '/customers', icon: Users,           label: 'কাস্টমার' },
  { to: '/purchases', icon: Truck,           label: 'ক্রয়' },
  { to: '/reports',   icon: BarChart2,       label: 'রিপোর্ট' },
  { to: '/settings',  icon: Settings,        label: 'সেটিংস' },
];

export default function MobileSidebar({ open, onClose, onLogout }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      {/* Drawer */}
      <aside className="relative w-72 bg-slate-900 text-white flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="font-bold text-sm">HardwareHub</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6 border-t border-slate-700 pt-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} />
            লগআউট
          </button>
        </div>
      </aside>
    </div>
  );
}
