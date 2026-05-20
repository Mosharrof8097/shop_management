import { Bell, Menu, ChevronDown } from 'lucide-react';

export default function Navbar({ shopName, userName, onMenuToggle }) {
  return (
    <header className="bg-white border-b border-gray-100 h-14 flex items-center px-5 gap-4 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <Menu size={19} />
      </button>

      {/* Shop name (mobile) */}
      <div className="lg:hidden flex-1">
        <span className="text-[0.88rem] font-bold text-gray-800">{shopName || 'HardwareHub'}</span>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:flex flex-1 items-center">
        <p className="text-[0.82rem] text-gray-400">
          স্বাগতম, <span className="text-gray-700 font-semibold">{userName || 'Admin'}</span>
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User pill */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-primary-700 text-[0.75rem] font-bold">
              {(userName || 'A')[0].toUpperCase()}
            </span>
          </div>
          <span className="text-[0.82rem] font-semibold text-gray-700 hidden sm:block">{userName || 'Admin'}</span>
          <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
