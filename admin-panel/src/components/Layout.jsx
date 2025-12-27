import { useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import GlobalSearch from './GlobalSearch';
import Loader from './Loader';
import useSocket from '../hooks/useSocket';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Initialize Socket.io connection for real-time notifications
  useSocket();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:pl-64 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-0 relative z-0" role="main">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      
      <GlobalSearch />
    </div>
  );
};

export default Layout;

