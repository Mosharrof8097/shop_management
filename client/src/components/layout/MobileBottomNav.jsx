import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, BarChart2 } from 'lucide-react';

const items = [
  { to: '/',         icon: LayoutDashboard, label: 'হোম' },
  { to: '/sales',    icon: ShoppingCart,    label: 'বিক্রি' },
  { to: '/products', icon: Package,         label: 'স্টক' },
  { to: '/reports',  icon: BarChart2,       label: 'রিপোর্ট' },
];

export default function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-bottom">
      <div className="flex">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
