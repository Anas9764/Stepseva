import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Briefcase,
  UserCheck,
  Phone,
  FileText,
  BarChart3,
  CalendarDays,
  Users2,
  Radio,
  ChevronDown,
  ChevronRight,
  History,
  Heart,
} from 'lucide-react';
import useNotifications from '../hooks/useNotifications';

const Sidebar = ({ isOpen, onClose }) => {
  const { notifications, markReviewsAsSeen, markQuestionsAsSeen, markOrdersAsSeen, markLeadsAsSeen } = useNotifications();
  const location = useLocation();
  const [isB2BOpen, setIsB2BOpen] = useState(true);
  const [isB2COpen, setIsB2COpen] = useState(false);

  // Common/Shared menu items (used by both B2B and B2C)
  const mainMenuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/categories', icon: Grid3x3, label: 'Categories' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/activity-logs', icon: History, label: 'Activity Logs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // B2B-specific menu items
  const b2bMenuItems = [
    {
      path: '/b2b',
      icon: Briefcase,
      label: 'B2B Overview',
    },
    { 
      path: '/b2b/leads', 
      icon: Phone, 
      label: 'B2B Leads',
      badge: notifications.newLeads > 0 ? notifications.newLeads : null,
      onNavigate: markLeadsAsSeen,
    },
    { 
      path: '/b2b/business-accounts', 
      icon: UserCheck, 
      label: 'Business Accounts',
    },
    {
      path: '/b2b/orders',
      icon: ShoppingBag,
      label: 'B2B Orders',
    },
    {
      path: '/b2b/lead-analytics',
      icon: BarChart3,
      label: 'Lead Analytics',
    },
    {
      path: '/b2b/product-analytics',
      icon: BarChart3,
      label: 'Product Analytics',
    },
    {
      path: '/b2b/quotes',
      icon: FileText,
      label: 'Quote Management',
    },
    {
      path: '/b2b/reports',
      icon: FileText,
      label: 'Reports & Export',
    },
    {
      path: '/b2b/communication',
      icon: Radio,
      label: 'Communication Center',
    },
    {
      path: '/b2b/team',
      icon: Users2,
      label: 'Team Management',
    },
    {
      path: '/b2b/calendar',
      icon: CalendarDays,
      label: 'Calendar & Reminders',
    },
    {
      path: '/b2b/crm',
      icon: Users,
      label: 'Buyer CRM',
    },
  ];

  // B2C-specific menu items
  const b2cMenuItems = [
    {
      path: '/b2c',
      icon: ShoppingBag,
      label: 'B2C Overview',
    },
    {
      path: '/b2c/orders',
      icon: ShoppingBag,
      label: 'B2C Orders',
    },
    { 
      path: '/b2c/reviews', 
      icon: Star, 
      label: 'Customer Reviews',
      badge: notifications.newReviews > 0 ? notifications.newReviews : null,
      onNavigate: markReviewsAsSeen,
    },
    { 
      path: '/b2c/questions', 
      icon: MessageCircle, 
      label: 'Customer Q&A',
      badge: notifications.newQuestions > 0 ? notifications.newQuestions : null,
      onNavigate: markQuestionsAsSeen,
    },
    {
      path: '/b2c/analytics',
      icon: BarChart3,
      label: 'B2C Analytics',
    },
    {
      path: '/b2c/support',
      icon: MessageCircle,
      label: 'Customer Support',
    },
    {
      path: '/b2c/coupons',
      icon: Tag,
      label: 'Coupons',
    },
    {
      path: '/b2c/banners',
      icon: Image,
      label: 'Banners',
    },
    {
      path: '/b2c/segmentation',
      icon: Users,
      label: 'Customer Segmentation',
    },
    {
      path: '/b2c/wishlists',
      icon: Heart,
      label: 'Wishlist Management',
    },
  ];

  // Sync B2B menu state with current route
  const isB2BActive = b2bMenuItems.some(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
  );

  // Sync B2C menu state with current route
  const isB2CActive = b2cMenuItems.some(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
  );

  useEffect(() => {
    if (isB2BActive) {
      setIsB2BOpen(true);
    }
    if (isB2CActive) {
      setIsB2COpen(true);
    }
  }, [location.pathname, isB2BActive, isB2CActive]);

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
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl lg:text-2xl font-bold text-primary dark:text-primary-200">
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
          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Main menu */}
            <div className="space-y-2">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={(e) => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                      if (item.onNavigate) {
                        item.onNavigate();
                      }
                    }}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 relative text-left ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                    aria-label={item.label}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* B2B module group */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsB2BOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  isB2BActive
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={20} />
                  <span>B2B Module</span>
                  {notifications.newLeads > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {notifications.newLeads > 9 ? '9+' : notifications.newLeads}
                    </span>
                  )}
                </div>
                {isB2BOpen ? (
                  <ChevronDown size={18} className="flex-shrink-0" />
                ) : (
                  <ChevronRight size={18} className="flex-shrink-0" />
                )}
              </button>

              {isB2BOpen && (
                <div className="mt-2 space-y-1 ml-3">
                  {b2bMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/b2b'}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                          if (item.onNavigate) {
                            item.onNavigate();
                          }
                        }}
                        className={({ isActive }) =>
                          `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 relative text-left ${
                            isActive
                              ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>

            {/* B2C module group */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsB2COpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  isB2CActive
                    ? 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} />
                  <span>B2C Module</span>
                  {(notifications.newReviews > 0 || notifications.newQuestions > 0) && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {(notifications.newReviews + notifications.newQuestions) > 9 ? '9+' : (notifications.newReviews + notifications.newQuestions)}
                    </span>
                  )}
                </div>
                {isB2COpen ? (
                  <ChevronDown size={18} className="flex-shrink-0" />
                ) : (
                  <ChevronRight size={18} className="flex-shrink-0" />
                )}
              </button>

              {isB2COpen && (
                <div className="mt-2 space-y-1 ml-3">
                  {b2cMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/b2c'}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                          if (item.onNavigate) {
                            item.onNavigate();
                          }
                        }}
                        className={({ isActive }) =>
                          `w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 relative text-left ${
                            isActive
                              ? 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
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

