import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useSocket from '../hooks/useSocket';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize Socket.io connection for real-time notifications
  useSocket();

  return (
    <div className="h-screen bg-neutral-light overflow-hidden flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:pl-64 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

