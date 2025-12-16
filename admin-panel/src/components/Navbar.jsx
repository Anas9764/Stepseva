import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import useNotifications from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useNotifications();
  const totalNotifications = notifications.newReviews + notifications.newQuestions + notifications.newOrders;
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);


  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name || 'Admin'}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotificationPanel(true)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={`${totalNotifications} new notifications`}
          >
            <Bell size={20} className="text-gray-600" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse z-10 px-1">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          <NotificationPanel 
            isOpen={showNotificationPanel} 
            onClose={() => setShowNotificationPanel(false)} 
          />

          {/* User Profile */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@stepseva.com'}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

