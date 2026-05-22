import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Shop Owner
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/Products/index';
import POS from './pages/Sales/POS';
import SaleHistory from './pages/Sales/SaleHistory';
import CustomerList from './pages/Customers/index';
import CustomerLedger from './pages/Customers/CustomerLedger';
import PurchaseList from './pages/Purchases/index';
import Reports from './pages/Reports/index';
import Settings from './pages/Settings/index';

// Super Admin
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import SADashboard from './pages/SuperAdmin/Dashboard';
import SAShops from './pages/SuperAdmin/Shops';
import SAShopDetail from './pages/SuperAdmin/ShopDetail';

// Auth / Subscription
import Register from './pages/auth/Register';
import SubscriptionRenew from './pages/Subscription/Renew';

// Route guards
function ShopRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/superadmin" replace />;
  return children;
}

function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/superadmin/login" replace />;
  if (user.role !== 'SUPER_ADMIN') return <Navigate to="/" replace />;
  return children;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { user, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Shop Owner Login ────────────────────────────────── */}
        <Route path="/login"
          element={user
            ? user.role === 'SUPER_ADMIN' ? <Navigate to="/superadmin" replace /> : <Navigate to="/" replace />
            : <Login onLogin={login} />}
        />

        {/* ── Shop Registration ───────────────────────────────── */}
        <Route path="/register"
          element={user
            ? user.role === 'SUPER_ADMIN' ? <Navigate to="/superadmin" replace /> : <Navigate to="/" replace />
            : <Register onLogin={login} />}
        />

        {/* ── Subscription Renewal (public — expired users need access) ── */}
        <Route path="/subscription/renew" element={<SubscriptionRenew />} />

        {/* ── Shop Owner App ──────────────────────────────────── */}
        <Route path="/" element={<ShopRoute><AppLayout onLogout={logout} /></ShopRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="sales" element={<POS />} />
          <Route path="sales/history" element={<SaleHistory />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/:id/ledger" element={<CustomerLedger />} />
          <Route path="purchases" element={<PurchaseList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Super Admin Login ───────────────────────────────── */}
        <Route path="/superadmin/login"
          element={user?.role === 'SUPER_ADMIN'
            ? <Navigate to="/superadmin" replace />
            : <Login onLogin={login} isSuperAdmin />}
        />

        {/* ── Super Admin Panel ───────────────────────────────── */}
        <Route path="/superadmin" element={<SuperAdminRoute><SuperAdminLayout onLogout={logout} /></SuperAdminRoute>}>
          <Route index element={<SADashboard />} />
          <Route path="shops" element={<SAShops />} />
          <Route path="shops/:id" element={<SAShopDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
