import React, { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, MessageSquare, Maximize } from 'lucide-react';

const Header = ({ setIsSidebarOpen }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 backdrop-blur-xl bg-white border-b border-gray-100/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)] sm:px-6 lg:px-8 transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-6 flex-1">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-gray-500 bg-gray-50/50 rounded-xl lg:hidden hover:bg-green-50 hover:text-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 active:scale-95">
          <Menu size={22} strokeWidth={2.5} />
        </button>

        <div className="hidden lg:flex items-center group">
          <div className="relative flex items-center w-80 xl:w-96">
            <Search size={18} className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-gray-50/50 border border-gray-200/80 rounded-md py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all duration-300"
            />
            <div className="absolute right-3 px-2 py-0.5 rounded border border-gray-200 bg-white text-[10px] font-medium text-gray-400">
              Ctrl K
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-gray-100">
          <button onClick={toggleFullScreen} className="p-2.5 text-gray-400 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 focus:outline-none">
            <Maximize size={20} strokeWidth={2} />
          </button>

          <button className="p-2.5 text-gray-400 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 focus:outline-none relative">
            <MessageSquare size={20} strokeWidth={2} />
            <span className="absolute top-2.5 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="p-2.5 text-gray-400 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all duration-200 focus:outline-none relative">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          </button>
        </div>

        <button className="flex items-center gap-3 pl-2 sm:pl-0 focus:outline-none outline-none group rounded-xl p-1 transition-all duration-200">
          <div className="relative">
            <img
              src="https://ui-avatars.com/api/?name=Admin+User&background=16a34a&color=fff&bold=true"
              alt="Profile"
              className="w-10 h-10 rounded-md object-cover shadow-sm ring-2 ring-transparent group-hover:ring-green-100 transition-all duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="hidden md:block text-left pr-1">
            <p className="text-sm font-bold text-gray-800 leading-tight group-hover:text-green-700 transition-colors">Admin User</p>
            <p className="text-xs text-gray-500 font-medium">Store Manager</p>
          </div>
          <div className="hidden md:flex p-1 rounded-lg text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
            <ChevronDown size={16} strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </header>
  )
}

export default Header