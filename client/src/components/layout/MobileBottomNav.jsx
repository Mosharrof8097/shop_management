import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, BarChart2, Users } from 'lucide-react';

const items = [
  { to: '/',          icon: LayoutDashboard, label: 'হোম' },
  { to: '/sales',     icon: ShoppingCart,    label: 'বিক্রি' },
  { to: '/products',  icon: Package,         label: 'স্টক' },
  { to: '/customers', icon: Users,           label: 'কাস্টমার' },
  { to: '/reports',   icon: BarChart2,       label: 'রিপোর্ট' },
];

export default function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
      <div className="flex items-stretch h-16">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
