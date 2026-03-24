import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import Header from './component/Header';
// import Breadcrumb from './component/Breadcrumb';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-left relative">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex flex-col min-h-screen transition-all duration-300 ml-0 min-[600px]:ml-20 lg:ml-72 w-auto">

        {/* Header */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 pb-8 overflow-x-hidden">
          <div>
            {/* <Breadcrumb /> */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;