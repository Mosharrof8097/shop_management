import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, LogOut, Shield,
  TrendingUp, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { path: '/superadmin',       icon: <LayoutDashboard size={18} />, label: 'ড্যাশবোর্ড'   },
  { path: '/superadmin/shops', icon: <Store size={18} />,          label: 'সব দোকান'     },
  { path: '/superadmin/revenue',icon: <TrendingUp size={18} />,    label: 'Revenue'      },
];

export default function SuperAdminLayout({ onLogout }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { onLogout(); navigate('/superadmin/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-indigo-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-400 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[0.9rem]">HardwareHub</p>
            <p className="text-indigo-300 text-[0.68rem]">Super Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.path || (item.path !== '/superadmin' && pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.83rem] font-semibold transition-all ${
                active
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
              }`}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + logout */}
      <div className="px-3 py-4 border-t border-indigo-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-[0.78rem] font-semibold truncate">Mosharrof</p>
            <p className="text-indigo-300 text-[0.68rem]">Super Admin</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.83rem] font-semibold text-indigo-200 hover:bg-red-500/20 hover:text-red-300 transition-all">
          <LogOut size={18} />লগআউট
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-indigo-900 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-indigo-900 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-600" />
            <span className="text-[0.82rem] font-bold text-indigo-600">Super Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
