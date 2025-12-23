import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSend,
  FiMessageSquare,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiX,
} from 'react-icons/fi';
import { fetchMessages, sendMessage, fetchNotifications, markNotificationAsRead, fetchUnreadCount } from '../store/slices/messagesSlice';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messages, notifications, unreadCount, loading } = useSelector((state) => state.messages);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'notifications'
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/messages' } });
      return;
    }

    if (!account || account.status !== 'active') {
      navigate('/dashboard');
      return;
    }

    // Fetch messages and notifications
    dispatch(fetchMessages());
    dispatch(fetchNotifications());
    dispatch(fetchUnreadCount());
  }, [isAuthenticated, account, dispatch, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await dispatch(sendMessage({
        message: messageText,
        type: 'general',
      })).unwrap();
      setMessageText('');
      toast.success('Message sent successfully');
      dispatch(fetchMessages());
    } catch (error) {
      toast.error(error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      dispatch(fetchUnreadCount());
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (loading && messages.length === 0 && notifications.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-secondary mb-2">Messages & Notifications</h1>
          <p className="text-gray-600">Communicate with suppliers and stay updated</p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'messages'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiMessageSquare size={20} />
                Messages
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors relative ${
                activeTab === 'notifications'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiBell size={20} />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-secondary mb-4">Messages</h2>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <FiMessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg ${
                        message.sender === 'admin' || message.senderType === 'admin'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {message.sender === 'admin' || message.senderType === 'admin' ? 'Admin' : 'You'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                        </div>
                        {message.read && (
                          <FiCheckCircle className="text-green-500" size={16} />
                        )}
                      </div>
                      <p className="text-gray-700">{message.message || message.content}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSend size={18} />
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setMessageText('I would like to inquire about bulk pricing.')}
                  className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  Request bulk pricing
                </button>
                <button
                  onClick={() => setMessageText('Can you provide more information about payment terms?')}
                  className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  Ask about payment terms
                </button>
                <button
                  onClick={() => setMessageText('I need to update my order. Please contact me.')}
                  className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  Update order request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-secondary mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <FiBell className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      notification.read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{notification.title || 'Notification'}</p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message || notification.content}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FiClock size={12} />
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {notification.read && (
                        <FiCheckCircle className="text-green-500" size={16} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

