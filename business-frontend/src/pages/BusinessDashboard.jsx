import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMessageCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { fetchBusinessAccount } from '../store/slices/businessAccountSlice';
import { fetchB2BStats, fetchRecentOrders, fetchRecentInquiries, fetchPendingQuotes } from '../store/slices/dashboardSlice';
import Loader from '../components/Loader';

const BusinessDashboard = () => {
  const dispatch = useDispatch();
  const { account, loading } = useSelector((state) => state.businessAccount);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { stats, recentOrders, recentInquiries, pendingQuotes, loading: dashboardLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBusinessAccount());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (account && account.status === 'active') {
      dispatch(fetchB2BStats());
      dispatch(fetchRecentOrders(5));
      dispatch(fetchRecentInquiries(5));
      dispatch(fetchPendingQuotes(5));
    }
  }, [account, dispatch]);

  if (loading) {
    return <Loader fullScreen />;
  }

  // If no business account, show setup prompt
  if (!account) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <FiAlertCircle className="mx-auto text-primary mb-4" size={64} />
            <h2 className="text-3xl font-heading font-bold text-secondary mb-4">
              Business Account Required
            </h2>
            <p className="text-gray-600 mb-8">
              To access B2B features, you need to create a business account. This allows you to:
            </p>
            <ul className="text-left space-y-2 mb-8 text-gray-700">
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Access volume pricing and bulk discounts
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Place orders with credit terms
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Manage purchase orders and invoices
              </li>
              <li className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Track order history and approvals
              </li>
            </ul>
            <Link
              to="/business-account/setup"
              className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Create Business Account
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Account pending approval
  if (account.status === 'pending') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <FiClock className="mx-auto text-amber-500 mb-4" size={64} />
            <h2 className="text-3xl font-heading font-bold text-secondary mb-4">
              Account Pending Approval
            </h2>
            <p className="text-gray-600 mb-4">
              Your business account application is under review. You'll receive an email once it's approved.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-sm text-amber-800">
                <strong>Company:</strong> {account.companyName}
              </p>
              <p className="text-sm text-amber-800">
                <strong>Business Type:</strong> {account.businessType.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Account suspended
  if (account.status === 'suspended') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <FiAlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-3xl font-heading font-bold text-secondary mb-4">
              Account Suspended
            </h2>
            <p className="text-gray-600 mb-4">
              Your business account has been suspended. Please contact support for assistance.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active account - show dashboard
  const creditAvailable = account.creditLimit - account.creditUsed;
  const creditPercentage = account.creditLimit > 0 
    ? (account.creditUsed / account.creditLimit) * 100 
    : 0;

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-secondary mb-2">
            Welcome back, {account.companyName}!
          </h1>
          <p className="text-gray-600">
            Manage your B2B orders, track credit, and access exclusive pricing
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Credit Available */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary"
          >
            <div className="flex items-center justify-between mb-4">
              <FiCreditCard className="text-primary" size={24} />
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                {account.pricingTier.toUpperCase()}
              </span>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Credit Available</h3>
            <p className="text-2xl font-bold text-secondary">
              ₹{creditAvailable.toLocaleString('en-IN')}
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  creditPercentage > 80 ? 'bg-red-500' : creditPercentage > 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(creditPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used: ₹{account.creditUsed.toLocaleString('en-IN')} / ₹{account.creditLimit.toLocaleString('en-IN')}
            </p>
          </motion.div>

          {/* Payment Terms */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-accent"
          >
            <FiFileText className="text-accent mb-4" size={24} />
            <h3 className="text-sm text-gray-600 mb-1">Payment Terms</h3>
            <p className="text-xl font-bold text-secondary">
              {account.paymentTerms.replace('net', 'Net ').toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Standard terms</p>
          </motion.div>

          {/* Business Type */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <FiTrendingUp className="text-green-500 mb-4" size={24} />
            <h3 className="text-sm text-gray-600 mb-1">Account Type</h3>
            <p className="text-xl font-bold text-secondary capitalize">
              {account.businessType.replace('_', ' ')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {account.isVerified ? (
                <span className="text-green-600 flex items-center gap-1">
                  <FiCheckCircle size={12} /> Verified
                </span>
              ) : (
                'Pending verification'
              )}
            </p>
          </motion.div>
        </div>

        {/* Recent Activity Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary">Recent Orders</h3>
              <Link
                to="/my-orders"
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View All
                <FiArrowRight size={14} />
              </Link>
            </div>
            {dashboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 3).map((order) => (
                  <Link
                    key={order._id}
                    to={`/order/${order._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">Order #{order.orderNumber || order._id.slice(-8)}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.orderStatus}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent orders</p>
            )}
          </motion.div>

          {/* Recent Inquiries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary">Recent Inquiries</h3>
              <Link
                to="/my-inquiries"
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View All
                <FiArrowRight size={14} />
              </Link>
            </div>
            {dashboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentInquiries.length > 0 ? (
              <div className="space-y-3">
                {recentInquiries.slice(0, 3).map((inquiry) => (
                  <Link
                    key={inquiry._id}
                    to="/my-inquiries"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{inquiry.productId?.name || 'Product Inquiry'}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(inquiry.createdAt).toLocaleDateString()} • {inquiry.status}
                      </p>
                    </div>
                    <FiMessageCircle className="text-primary" size={20} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No recent inquiries</p>
            )}
          </motion.div>
        </div>

        {/* Pending Quotes */}
        {pendingQuotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FiClock className="text-yellow-600" size={24} />
                <h3 className="text-lg font-semibold text-secondary">Pending Quotes</h3>
                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingQuotes.length}
                </span>
              </div>
              <Link
                to="/my-quotes"
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View All
                <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {pendingQuotes.slice(0, 3).map((quote) => (
                <Link
                  key={quote._id}
                  to="/my-quotes"
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-semibold text-sm">Quote #{quote.quoteNumber || quote._id.slice(-8)}</p>
                    <p className="text-xs text-gray-600">
                      {quote.productId?.name || 'Product'} • {formatCurrency(quote.totalAmount)}
                    </p>
                  </div>
                  <FiFileText className="text-yellow-600" size={20} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/shop"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <FiPackage className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-secondary mb-2">Browse Products</h3>
            <p className="text-sm text-gray-600">
              Explore our catalog with volume pricing and bulk discounts
            </p>
          </Link>

          <Link
            to="/my-orders"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <FiFileText className="text-accent mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-secondary mb-2">Order History</h3>
            <p className="text-sm text-gray-600">
              View past orders, invoices, and track shipments
            </p>
          </Link>

          <Link
            to="/my-inquiries"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
          >
            <FiMessageCircle className="text-green-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="text-lg font-semibold text-secondary mb-2">My Inquiries</h3>
            <p className="text-sm text-gray-600">
              Track your product inquiries and quote requests
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;

