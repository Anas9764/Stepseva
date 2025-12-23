import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  MessageSquare, 
  Star, 
  CheckCircle2,
  Clock,
  Bell,
  Briefcase,
} from 'lucide-react';
import useNotifications from '../hooks/useNotifications';

const NotificationPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    notificationItems,
    markAsRead,
    markAllAsRead,
    markOrdersAsSeen,
    markQuestionsAsSeen,
    markReviewsAsSeen,
    markLeadsAsSeen,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'orders', 'questions', 'reviews', 'leads'

  // Map tab names to notification types (tabs are plural, types are singular)
  const getTypeForTab = (tab) => {
    const tabToTypeMap = {
      'all': null, // null means show all
      'orders': 'order',
      'questions': 'question',
      'reviews': 'review',
      'leads': 'lead',
    };
    return tabToTypeMap[tab] || null;
  };

  // Filter notifications by tab
  const filteredNotifications = notificationItems.filter(item => {
    if (activeTab === 'all') return true;
    const targetType = getTypeForTab(activeTab);
    return targetType && item.type === targetType;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('NotificationPanel Debug:', {
        activeTab,
        targetType: getTypeForTab(activeTab),
        totalItems: notificationItems.length,
        filteredCount: filteredNotifications.length,
        itemsByType: {
          order: notificationItems.filter(i => i.type === 'order').length,
          question: notificationItems.filter(i => i.type === 'question').length,
          review: notificationItems.filter(i => i.type === 'review').length,
        },
        filteredItems: filteredNotifications,
      });
    }
  }, [notificationItems, filteredNotifications, activeTab]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'order':
        markOrdersAsSeen();
        navigate('/orders');
        break;
      case 'question':
        markQuestionsAsSeen();
        navigate('/questions');
        break;
      case 'review':
        markReviewsAsSeen();
        navigate('/reviews');
        break;
      case 'lead':
        markLeadsAsSeen();
        navigate('/leads');
        break;
      default:
        break;
    }
    onClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'question':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'lead':
        return <Briefcase className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-green-50 border-green-200';
      case 'question':
        return 'bg-blue-50 border-blue-200';
      case 'review':
        return 'bg-yellow-50 border-yellow-200';
      case 'lead':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Notifications</h2>
                  <p className="text-sm text-white/80">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'all'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
                {notifications.newOrders + notifications.newQuestions + notifications.newReviews + notifications.newLeads > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {notifications.newOrders + notifications.newQuestions + notifications.newReviews + notifications.newLeads}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'orders'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orders
                {notifications.newOrders > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {notifications.newOrders}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'questions'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Questions
                {notifications.newQuestions > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {notifications.newQuestions}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'reviews'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews
                {notifications.newReviews > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {notifications.newReviews}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'leads'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leads
                {notifications.newLeads > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {notifications.newLeads}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {activeTab === 'all' 
                      ? "You're all caught up!" 
                      : `No ${activeTab.slice(0, -1)} notifications`}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        notification.read
                          ? 'bg-white border-gray-200'
                          : `${getNotificationColor(notification.type)} border-l-4`
                      } hover:shadow-md`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'order' ? 'bg-green-100' :
                          notification.type === 'question' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;

