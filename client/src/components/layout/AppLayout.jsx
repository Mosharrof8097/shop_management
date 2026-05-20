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
    <div className="flex h-screen overflow-hidden bg-[#f8faf8]">
      {/* Desktop sidebar */}
      <Sidebar shopName={mockShop.name} onLogout={onLogout} />

      {/* Mobile sidebar drawer */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={onLogout}
        shopName={mockShop.name}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          shopName={mockShop.name}
          userName="Admin"
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
