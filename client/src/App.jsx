import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={login} />} />
        <Route path="/" element={<ProtectedRoute><AppLayout onLogout={logout} /></ProtectedRoute>}>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
