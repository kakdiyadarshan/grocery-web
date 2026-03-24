import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './component/Sidebar'
import Header from './component/Header'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen font-sans font-inter selection:bg-green-100 selection:text-green-900">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 w-full min-w-0 transition-all duration-300 ease-in-out">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout