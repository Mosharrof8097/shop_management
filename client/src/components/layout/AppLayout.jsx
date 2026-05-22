import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import MobileSidebar from './MobileSidebar';
import { useAuth } from '../../hooks/useAuth';

export default function AppLayout({ onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const shopName = user?.shop?.name || 'HardwareHub';
  const userName = user?.name || 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8faf8]">
      {/* Desktop sidebar */}
      <Sidebar shopName={shopName} onLogout={onLogout} />

      {/* Mobile sidebar drawer */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={onLogout}
        shopName={shopName}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          shopName={shopName}
          userName={userName}
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
