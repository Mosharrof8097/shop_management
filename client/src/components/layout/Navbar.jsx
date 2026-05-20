import { Bell, Menu, User } from 'lucide-react';

export default function Navbar({ shopName, userName, onMenuToggle }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Left: hamburger (mobile) + shop name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-base font-semibold text-gray-800">{shopName}</h1>
        </div>
        <div className="lg:hidden">
          <h1 className="text-base font-semibold text-gray-800">HardwareHub</h1>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
          <User size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {userName || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
