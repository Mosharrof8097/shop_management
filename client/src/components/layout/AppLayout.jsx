import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import MobileSidebar from './MobileSidebar';
import { mockShop } from '../../data/mockData';

export default function AppLayout({ onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Mobile drawer sidebar */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={onLogout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          shopName={mockShop.name}
          userName="Admin"
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
