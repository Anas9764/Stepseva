import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Image,
  Tag,
  Settings,
  Grid3x3,
  X,
  Star,
  MessageCircle,
} from 'lucide-react';
import useNotifications from '../hooks/useNotifications';

const Sidebar = ({ isOpen, onClose }) => {
  const { notifications, markReviewsAsSeen, markQuestionsAsSeen, markOrdersAsSeen } = useNotifications();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/categories', icon: Grid3x3, label: 'Categories' },
    { 
      path: '/orders', 
      icon: ShoppingBag, 
      label: 'Orders',
      badge: notifications.newOrders > 0 ? notifications.newOrders : null,
      onNavigate: markOrdersAsSeen,
    },
    { 
      path: '/reviews', 
      icon: Star, 
      label: 'Reviews',
      badge: notifications.newReviews > 0 ? notifications.newReviews : null,
      onNavigate: markReviewsAsSeen,
    },
    { 
      path: '/questions', 
      icon: MessageCircle, 
      label: 'Q&A',
      badge: notifications.newQuestions > 0 ? notifications.newQuestions : null,
      onNavigate: markQuestionsAsSeen,
    },
    { path: '/coupons', icon: Tag, label: 'Coupons' },
    { path: '/banners', icon: Image, label: 'Banners' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary">
              StepSeva Admin
            </h1>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  window.innerWidth < 1024 && onClose();
                  // Mark as seen when navigating
                  if (item.onNavigate) {
                    item.onNavigate();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-sky rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium">StepSeva Admin v1.0</p>
              <p className="text-xs text-gray-500 mt-1">Premium Admin Panel</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

